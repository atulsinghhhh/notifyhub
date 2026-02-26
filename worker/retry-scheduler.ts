/**
 * Retry Scheduler
 *
 * Polls the database every 10 seconds for notifications that are due for retry
 * (status = QUEUED, nextRetryAt <= now) and re-publishes them to Kafka.
 *
 * Run with: npx tsx worker/retry-scheduler.ts
 */

import { Kafka } from "kafkajs";
import { PrismaClient } from "../app/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { TOPICS } from "../lib/kafka";
import * as dotenv from "dotenv";
import path from "path";

dotenv.config({ path: path.join(process.cwd(), ".env") });

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

const kafka = new Kafka({
    clientId: "notifyhub-retry-scheduler",
    brokers: (process.env.KAFKA_BROKERS || "localhost:9092").split(","),
});

const producer = kafka.producer();

const POLL_INTERVAL_MS = 10_000; // 10 seconds
const BATCH_SIZE = 100;

async function pollAndRepublish(): Promise<void> {
    const now = new Date();

    // Pick up retries that are due
    const dueRetries = await prisma.notification.findMany({
        where: {
            status: "QUEUED",
            nextRetryAt: { lte: now },
            retryCount: { gt: 0 },
        },
        select: { id: true },
        take: BATCH_SIZE,
        orderBy: { nextRetryAt: "asc" },
    });

    // Also pick up stale fresh notifications stuck in QUEUED
    // (e.g. worker was down when they were published to Kafka)
    const staleThreshold = new Date(now.getTime() - 60_000); // older than 60s
    const staleFresh = await prisma.notification.findMany({
        where: {
            status: "QUEUED",
            retryCount: 0,
            nextRetryAt: null,
            queuedAt: { lte: staleThreshold },
        },
        select: { id: true },
        take: BATCH_SIZE,
        orderBy: { queuedAt: "asc" },
    });

    const dueNotifications = [...dueRetries, ...staleFresh];

    if (dueNotifications.length === 0) return;

    console.log(`[RETRY-SCHEDULER] Found ${dueNotifications.length} notifications due for retry`);

    // Publish all due notifications back to Kafka
    await producer.send({
        topic: TOPICS.NOTIFICATION_SEND,
        messages: dueNotifications.map((n) => ({
            key: n.id,
            value: JSON.stringify({ notificationId: n.id }),
        })),
    });

    // Clear nextRetryAt so they don't get picked up again
    const ids = dueNotifications.map((n) => n.id);
    await prisma.notification.updateMany({
        where: { id: { in: ids } },
        data: { nextRetryAt: null },
    });

    console.log(`[RETRY-SCHEDULER] Re-published ${ids.length} notifications to Kafka`);
}

async function main(): Promise<void> {
    console.log("Retry Scheduler starting…");
    await producer.connect();
    console.log(`Polling every ${POLL_INTERVAL_MS / 1000}s for retry-eligible notifications`);

    // Run immediately, then on interval
    await pollAndRepublish();

    setInterval(async () => {
        try {
            await pollAndRepublish();
        } catch (error) {
            console.error("[RETRY-SCHEDULER] Poll error:", error);
        }
    }, POLL_INTERVAL_MS);
}

async function shutdown(): Promise<void> {
    console.log("\n Retry Scheduler shutting down…");
    await producer.disconnect();
    await prisma.$disconnect();
    process.exit(0);
}

process.on("SIGINT", shutdown);
process.on("SIGTERM", shutdown);

main().catch((err) => {
    console.error(" Retry Scheduler failed:", err);
    process.exit(1);
});
