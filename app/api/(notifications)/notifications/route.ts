import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { notificationSchema, type NotificationInput } from "@/lib/zod/notification/notifications";
import { authenticateApiKey, isAuthError } from "@/lib/auth-api-key";
import { publishNotification } from "@/lib/kafka";
import { isInQuietHours, renderTemplate } from "@/lib/utilis";
import { NotificationStatus,NotificationChannel } from "@/lib/utilis";

export async function POST(request: NextRequest) {
    try {
        // Step 1: Authentication (API key)
        const authResult = await authenticateApiKey(request);
        if (isAuthError(authResult)) return authResult;
        const { tenantId } = authResult;

        // Step 2: Validate Input
        const rawBody = await request.json();
        const validation = notificationSchema.safeParse(rawBody);
        if (!validation.success) {
            return NextResponse.json(
                { error: "Validation failed", details: validation.error.flatten().fieldErrors },
                { status: 400 }
            );
        }

        const data = validation.data;

        // Step 3: Deduplication Check
        if (data.idempotencyKey) {
            const existing = await prisma.notification.findFirst({
                where: { tenantId, idempotencyKey: data.idempotencyKey },
            });
            if (existing) {
                // Return the existing notification — idempotent behavior
                return NextResponse.json(
                    { notificationId: existing.id, status: existing.status },
                    { status: 200 }
                );
            }
        }

        // Step 4: Validate Recipient (multi-tenant)
        const recipient = await prisma.recipient.findFirst({
            where: { id: data.recipientId, tenantId },
        });
        if (!recipient) {
            return NextResponse.json({ error: "Recipient not found" }, { status: 404 });
        }

        // Step 5: Check Preferences 
        const preference = await prisma.notificationPreference.findFirst({
            where: { recipientId: data.recipientId, channel: data.channel },
        });

        if (preference) {
            if (!preference.enabled) {
                return NextResponse.json(
                    { error: `Recipient has opted out of ${data.channel} notifications` },
                    { status: 400 }
                );
            }

            // Quiet hours check
            if (preference.quietHoursStart && preference.quietHoursEnd) {
                const tz = recipient.timezone || "UTC";
                if (isInQuietHours(preference.quietHoursStart, preference.quietHoursEnd, tz)) {
                    return NextResponse.json(
                        { error: "Recipient is in quiet hours, notification will not be sent" },
                        { status: 400 }
                    );
                }
            }
        }

        //  Step 6: Template Rendering
        let finalSubject = data.subject ?? null;
        let finalBody = data.body ?? null;

        if (data.templateId) {
            const template = await prisma.notificationTemplate.findFirst({
                where: { id: data.templateId, tenantId },
            });
            if (!template) {
                return NextResponse.json({ error: "Template not found" }, { status: 404 });
            }

            finalSubject = renderTemplate(template.subject, data.variables);
            finalBody = renderTemplate(template.body, data.variables);
        }

        if (!finalBody) {
            return NextResponse.json(
                { error: "Either body or a valid templateId with body is required" },
                { status: 400 }
            );
        }

        // Step 7: Insert Notification Record
        const notification = await prisma.notification.create({
            data: {
                tenantId,
                recipientId: data.recipientId,
                channel: data.channel,
                templateId: data.templateId ?? null,
                subject: finalSubject,
                body: finalBody,
                idempotencyKey: data.idempotencyKey ?? null,
                priority: data.priority ?? "NORMAL",
                scheduledAt: data.scheduledAt ? new Date(data.scheduledAt) : null,
                status: "PENDING",
                retryCount: 0,
            },
        });

        // Step 8: Queue Event via Kafka
        await publishNotification(notification.id);

        // Update status to QUEUED
        await prisma.notification.update({
            where: { id: notification.id },
            data: { status: "QUEUED", queuedAt: new Date() },
        });

        // Step 9: API Response
        return NextResponse.json(
            { notificationId: notification.id, status: "QUEUED" },
            { status: 201 }
        );
    } catch (error) {
        console.error("Send Notification Error:", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}

export async function GET(request: NextRequest){
    try {
        const authResult = await authenticateApiKey(request);
        if (isAuthError(authResult)) return authResult;
        const { tenantId } = authResult;

        const { searchParams } = new URL(request.url);
        const status = searchParams.get("status");
        const channel = searchParams.get("channel");
        const date = searchParams.get("date");
        const page = parseInt(searchParams.get("page") || "1");
        const limit = parseInt(searchParams.get("limit") || "10");

        const notifications = await prisma.notification.findMany({
            where: {
                tenantId,
                status: status as NotificationStatus,
                channel: channel as NotificationChannel,
                createdAt: date ? { gte: new Date(date) } : undefined,
            },
            take: limit,
            skip: (page - 1) * limit,
        });

        return NextResponse.json(notifications);
    } catch (error) {
        console.log("Error fetching notifications:", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}