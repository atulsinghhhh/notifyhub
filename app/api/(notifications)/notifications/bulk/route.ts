import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { bulkNotificationSchema, type NotificationInput } from "@/lib/zod/notification/notifications";
import { authenticateRequest, isDualAuthError } from "@/lib/auth-dual";
import { publishNotificationBatch } from "@/lib/kafka";


interface BulkResultSuccess {
    index: number;
    notificationId: string;
    status: string;
}

interface BulkResultError {
    index: number;
    error: string;
}

type BulkResult = BulkResultSuccess | BulkResultError;

export async function POST(request: NextRequest) {
    try {
        const authResult = await authenticateRequest(request);
        if (isDualAuthError(authResult)) return authResult;
        const { tenantId } = authResult;

        const rawBody = await request.json();
        const validation = bulkNotificationSchema.safeParse(rawBody);
        if (!validation.success) {
            return NextResponse.json(
                { error: "Validation failed", details: validation.error.flatten().fieldErrors },
                { status: 400 }
            );
        }

        const { notifications } = validation.data;
        const results: BulkResult[] = [];
        const queuedIds: string[] = [];

        for (let i = 0; i < notifications.length; i++) {
            try {
                const result = await processSingleNotification(tenantId, notifications[i], i);
                results.push(result);
                if ("notificationId" in result) {
                    queuedIds.push(result.notificationId);
                }
            } catch (err) {
                results.push({
                    index: i,
                    error: err instanceof Error ? err.message : "Unexpected error",
                });
            }
        }

        // ── Batch queue all successful notifications ─────────
        if (queuedIds.length > 0) {
            await publishNotificationBatch(queuedIds);

            // Bulk update status to QUEUED
            await prisma.notification.updateMany({
                where: { id: { in: queuedIds } },
                data: { status: "QUEUED", queuedAt: new Date() },
            });

            // Update result statuses
            for (const r of results) {
                if ("notificationId" in r && queuedIds.includes(r.notificationId)) {
                    r.status = "QUEUED";
                }
            }
        }

        // ── Response ─────────────────────────────────────────
        const totalSuccess = results.filter((r) => "notificationId" in r).length;
        const totalFailed = results.filter((r) => "error" in r).length;

        return NextResponse.json(
            {
                total: notifications.length,
                success: totalSuccess,
                failed: totalFailed,
                results,
            },
            { status: 201 }
        );
    } catch (error) {
        console.error("Bulk Notification Error:", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}


async function processSingleNotification(
    tenantId: string,
    data: NotificationInput,
    index: number
): Promise<BulkResult> {
    // Deduplication
    if (data.idempotencyKey) {
        const existing = await prisma.notification.findFirst({
            where: { tenantId, idempotencyKey: data.idempotencyKey },
        });
        if (existing) {
            return { index, notificationId: existing.id, status: existing.status };
        }
    }

    // Resolve & Validate Recipient (multi-tenant isolation)
    let recipientId = data.recipientId;

    if (!recipientId && (data.email || data.phone)) {
        const recipient = await prisma.recipient.findFirst({
            where: {
                tenantId,
                OR: [
                    ...(data.email ? [{ email: data.email }] : []),
                    ...(data.phone ? [{ phone: data.phone }] : []),
                ],
            },
            select: { id: true },
        });

        if (!recipient) {
            return { index, error: "Recipient not found for the provided email/phone" };
        }
        recipientId = recipient.id;
    }

    if (!recipientId) {
        return { index, error: "Recipient identifier required" };
    }

    const recipient = await prisma.recipient.findFirst({
        where: { id: recipientId, tenantId },
    });
    if (!recipient) {
        return { index, error: "Recipient not found" };
    }

    // Check Preferences
    const preference = await prisma.notificationPreference.findFirst({
        where: { recipientId: recipientId, channel: data.channel },
    });

    if (preference) {
        if (!preference.enabled) {
            return { index, error: `Recipient has opted out of ${data.channel} notifications` };
        }

        if (preference.quietHoursStart && preference.quietHoursEnd) {
            const tz = recipient.timezone || "UTC";
            if (isInQuietHours(preference.quietHoursStart, preference.quietHoursEnd, tz)) {
                return { index, error: "Recipient is in quiet hours" };
            }
        }
    }

    // Template Rendering
    let finalSubject = data.subject ?? null;
    let finalBody = data.body ?? null;

    if (data.templateId) {
        const template = await prisma.notificationTemplate.findFirst({
            where: { id: data.templateId, tenantId },
        });
        if (!template) {
            return { index, error: "Template not found" };
        }
        finalSubject = renderTemplate(template.subject, data.variables);
        finalBody = renderTemplate(template.body, data.variables);
    }

    if (!finalBody) {
        return { index, error: "Either body or a valid templateId with body is required" };
    }

    // Insert Notification (status = PENDING, updated to QUEUED after batch publish)
    const notification = await prisma.notification.create({
        data: {
            tenantId,
            recipientId: recipientId,
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


    return { index, notificationId: notification.id, status: "PENDING" };
}


function renderTemplate(
    template: string | null | undefined,
    variables?: Record<string, string>
): string | null {
    if (!template) return null;
    if (!variables) return template;
    return template.replace(/\{\{(\w+)\}\}/g, (match, key) => {
        return variables[key] !== undefined ? variables[key] : match;
    });
}

function isInQuietHours(start: string, end: string, timezone: string): boolean {
    try {
        const now = new Date();
        const formatter = new Intl.DateTimeFormat("en-US", {
            timeZone: timezone,
            hour: "2-digit",
            minute: "2-digit",
            hour12: false,
        });
        const parts = formatter.formatToParts(now);
        const hour = parseInt(parts.find((p) => p.type === "hour")?.value || "0");
        const minute = parseInt(parts.find((p) => p.type === "minute")?.value || "0");
        const currentMinutes = hour * 60 + minute;

        const [startH, startM] = start.split(":").map(Number);
        const [endH, endM] = end.split(":").map(Number);
        const startMinutes = startH * 60 + startM;
        const endMinutes = endH * 60 + endM;

        if (startMinutes <= endMinutes) {
            return currentMinutes >= startMinutes && currentMinutes < endMinutes;
        } else {
            return currentMinutes >= startMinutes || currentMinutes < endMinutes;
        }
    } catch {
        return false;
    }
}
