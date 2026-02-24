/**
 * NotifyHub Kafka Consumer Worker
 *
 * Standalone process — run with: npx tsx worker/consumer.ts
 *
 * Flow per message:
 *   1. Parse { notificationId } from Kafka message
 *   2. Fetch notification + recipient + device tokens from DB
 *   3. Skip if status ≠ QUEUED (already processed / retried)
 *   4. Set status → PROCESSING
 *   5. Resolve contact info (email / phone / device token)
 *   6. Call provider.send()
 *   7. Write DeliveryLog entry
 *   8. On success → status = SENT, sentAt = now
 *   9. On failure → retry or move to Dead Letter Queue
 */

import { Kafka, EachMessagePayload } from "kafkajs";
import { prisma } from "../lib/prisma";
import { getProvider } from "../lib/providers";
import { TOPICS } from "../lib/kafka";


// ── Kafka consumer ──
const kafka = new Kafka({
    clientId: "notifyhub-worker",
    brokers: (process.env.KAFKA_BROKERS || "localhost:9092").split(","),
});

const consumer = kafka.consumer({ groupId: "notifyhub-workers" });
const producer = kafka.producer();

// ── Retry constants ──
const BASE_DELAY_MS = 1000; // 1 second

function getRetryDelay(retryCount: number): number {
    return Math.pow(2, retryCount) * BASE_DELAY_MS; // 1s, 2s, 4s, 8s …
}

// ── Resolve recipient "to" address based on channel ──
async function resolveRecipientAddress(recipientId: string, channel: string): Promise<string | null> {

    const recipient = await prisma.recipient.findUnique({
        where: { id: recipientId },
        include: { deviceTokens: true },
    });

    if (!recipient) return null;

    switch (channel) {
        case "EMAIL":
            return recipient.email || null;
        case "SMS":
            return recipient.phone || null;
        case "PUSH": {
            // Use the most recent device token
            const token = recipient.deviceTokens?.[0];
            return token?.token || null;
        }
        default:
            return null;
    }
}

// ── Process a single notification ──
async function processNotification(notificationId: string): Promise<void> {
    // Fetch notification
    const notification = await prisma.notification.findUnique({
        where: { id: notificationId },
    });

    if (!notification) {
        console.warn(`[SKIP] Notification ${notificationId} not found in DB`);
        return;
    }

    // Only process QUEUED notifications
    if (notification.status !== "QUEUED") {
        console.log(`[SKIP] Notification ${notificationId} status is ${notification.status}, skipping`);
        return;
    }

    if (!notification.recipientId) {
        console.warn(`[SKIP] Notification ${notificationId} has no recipientId`);
        await markFailed(notification.id, "No recipientId on notification");
        return;
    }

    // Set status → PROCESSING
    await prisma.notification.update({
        where: { id: notificationId },
        data: { status: "PROCESSING" },
    });

    console.log(`[PROCESSING] ${notificationId} | channel=${notification.channel}`);

    // Resolve the "to" address
    const to = await resolveRecipientAddress(notification.recipientId, notification.channel);
    if (!to) {
        console.warn(`[FAIL] No contact address for recipient ${notification.recipientId} on channel ${notification.channel}`);
        await handleFailure(notification, "No contact address found for recipient");
        return;
    }

    // Get the provider for this channel
    let provider;
    try {
        provider = getProvider(notification.channel);
    } catch {
        await handleFailure(notification, `No provider for channel ${notification.channel}`);
        return;
    }

    // Send the notification
    const result = await provider.send({
        to,
        subject: notification.subject,
        body: notification.body,
        metadata: notification.metadata as Record<string, unknown> | undefined,
    });

    // Write DeliveryLog
    await prisma.deliveryLog.create({
        data: {
            notificationId: notification.id,
            eventType: result.success ? "SENT" : "FAILED",
            provider: provider.name,
            statusCode: result.statusCode,
            response: (result.response || result.error || "").slice(0, 1000), // truncate
        },
    });

    if (result.success) {
        await prisma.notification.update({
            where: { id: notification.id },
            data: {
                status: "SENT",
                sentAt: new Date(),
                providerId: null, // Could resolve from Provider table if needed
            },
        });
        console.log(`[SENT] ${notificationId} via ${provider.name} → ${to}`);
    } else {
        console.error(`[FAIL] ${notificationId} via ${provider.name}: ${result.error}`);
        await handleFailure(notification, result.error || "Provider returned failure");
    }
}

// ── Handle failure: retry or dead-letter ──
async function handleFailure(notification: { id: string; retryCount: number; maxRetries: number }, errorMessage: string): Promise<void> {
    const nextRetry = notification.retryCount + 1;

    if (nextRetry <= notification.maxRetries) {
        // Schedule retry with exponential backoff
        const delayMs = getRetryDelay(nextRetry);
        const nextRetryAt = new Date(Date.now() + delayMs);

        await prisma.notification.update({
            where: { id: notification.id },
            data: {
                status: "QUEUED",
                retryCount: nextRetry,
                nextRetryAt,
            },
        });

        // Log the retry event
        await prisma.deliveryLog.create({
            data: {
                notificationId: notification.id,
                eventType: "RETRIED",
                response: `Retry ${nextRetry}/${notification.maxRetries} scheduled for ${nextRetryAt.toISOString()} (delay: ${delayMs}ms). Error: ${errorMessage}`,
            },
        });

        console.log(`[RETRY] ${notification.id} → attempt ${nextRetry}/${notification.maxRetries} in ${delayMs}ms`);
    } else {
        // Max retries exhausted → move to Dead Letter Queue
        await prisma.notification.update({
            where: { id: notification.id },
            data: { status: "FAILED", failedAt: new Date() },
        });

        await prisma.deadLetterQueue.create({
            data: {
                notificationId: notification.id,
                reason: `Max retries (${notification.maxRetries}) exhausted. Last error: ${errorMessage}`,
                payload: notification as any,
                retryable: false,
            },
        });

        // Log the DLQ event
        await prisma.deliveryLog.create({
            data: {
                notificationId: notification.id,
                eventType: "FAILED",
                response: `Moved to Dead Letter Queue after ${notification.maxRetries} retries. Error: ${errorMessage}`,
            },
        });

        console.log(`[DLQ] ${notification.id} → moved to Dead Letter Queue after ${notification.maxRetries} retries`);
    }
}

// ── Mark a notification as failed immediately (no retry) ──
async function markFailed(notificationId: string, reason: string): Promise<void> {
    await prisma.notification.update({
        where: { id: notificationId },
        data: { status: "FAILED", failedAt: new Date() },
    });

    await prisma.deliveryLog.create({
        data: {
            notificationId,
            eventType: "FAILED",
            response: reason.slice(0, 1000),
        },
    });
}

// ── Kafka message handler ──
async function handleMessage({ message }: EachMessagePayload): Promise<void> {
    if (!message.value) return;

    try {
        const { notificationId } = JSON.parse(message.value.toString());
        if (!notificationId) {
            console.warn("[SKIP] Message missing notificationId");
            return;
        }
        await processNotification(notificationId);
    } catch (error) {
        console.error("[ERROR] Failed to process message:", error);
    }
}

// ── Main entry point ──
async function main(): Promise<void> {
    console.log("🚀 NotifyHub Worker starting…");

    await producer.connect();
    await consumer.connect();
    await consumer.subscribe({ topic: TOPICS.NOTIFICATION_SEND, fromBeginning: false });

    console.log(`📡 Subscribed to topic: ${TOPICS.NOTIFICATION_SEND}`);

    await consumer.run({ eachMessage: handleMessage });

    console.log("Worker is running. Waiting for messages…");
}

// ── Graceful shutdown ──
async function shutdown(): Promise<void> {
    console.log("\n Shutting down worker…");
    await consumer.disconnect();
    await producer.disconnect();
    await prisma.$disconnect();
    process.exit(0);
}

process.on("SIGINT", shutdown);
process.on("SIGTERM", shutdown);

main().catch((err) => {
    console.error("Worker failed to start:", err);
    process.exit(1);
});
