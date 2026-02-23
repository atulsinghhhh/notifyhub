import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { notificationSchema, type NotificationInput } from "@/lib/zod/notification/notifications";
import { authenticateApiKey, isAuthError } from "@/lib/auth-api-key";
import { publishNotification } from "@/lib/kafka";

// ─────────────────────────────────────────────────────────────
// POST /api/notifications — Send a Single Notification
// ─────────────────────────────────────────────────────────────

export async function POST(request: NextRequest) {
    try {
        // ── Step 1: Authentication (API key) ─────────────────
        const authResult = await authenticateApiKey(request);
        if (isAuthError(authResult)) return authResult;
        const { tenantId } = authResult;

        // ── Step 2: Validate Input ───────────────────────────
        const rawBody = await request.json();
        const validation = notificationSchema.safeParse(rawBody);
        if (!validation.success) {
            return NextResponse.json(
                { error: "Validation failed", details: validation.error.flatten().fieldErrors },
                { status: 400 }
            );
        }

        const data = validation.data;

        // ── Step 3: Deduplication Check ──────────────────────
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

        // ── Step 4: Validate Recipient (multi-tenant) ────────
        const recipient = await prisma.recipient.findFirst({
            where: { id: data.recipientId, tenantId },
        });
        if (!recipient) {
            return NextResponse.json({ error: "Recipient not found" }, { status: 404 });
        }

        // ── Step 5: Check Preferences ────────────────────────
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

        // ── Step 6: Template Rendering ───────────────────────
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

        // ── Step 7: Insert Notification Record ───────────────
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

        // ── Step 8: Queue Event via Kafka ────────────────────
        await publishNotification(notification.id);

        // Update status to QUEUED
        await prisma.notification.update({
            where: { id: notification.id },
            data: { status: "QUEUED", queuedAt: new Date() },
        });

        // ── Step 9: API Response ─────────────────────────────
        return NextResponse.json(
            { notificationId: notification.id, status: "QUEUED" },
            { status: 201 }
        );
    } catch (error) {
        console.error("Send Notification Error:", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}

// ─────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────

/**
 * Replace `{{variableName}}` placeholders in a template string.
 * Returns null if the input template is null/undefined.
 */
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

/**
 * Check if the current time (in the recipient's timezone) falls in quiet hours.
 * quietHoursStart/End are "HH:mm" strings, e.g. "22:00" / "08:00".
 */
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
            // Same-day window e.g. 09:00 – 17:00
            return currentMinutes >= startMinutes && currentMinutes < endMinutes;
        } else {
            // Overnight window e.g. 22:00 – 08:00
            return currentMinutes >= startMinutes || currentMinutes < endMinutes;
        }
    } catch {
        // If timezone parsing fails, allow the notification through
        return false;
    }
}