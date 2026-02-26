import crypto from "crypto";
import { generateSlug } from "./zod/tenantsSchema";
import { prisma } from "./prisma";

export async function generateUniqueSlug(name: string) {
    const baseSlug = generateSlug(name);
    let slug = baseSlug;
    let cnt = 1;

    while (true) {
        const existing = await prisma.tenant.findUnique({ where: { slug } });
        if (!existing) break;
        slug = `${baseSlug}-${cnt++}`;
    }
    return slug;
}

export function generateAPIKEY() {
    const random = crypto.randomBytes(32).toString("hex");
    const rawKey = `${Date.now()}-${random}`;
    return rawKey;
}

export function hashAPIKey(rawKey: string) {
    return crypto.createHash("sha256").update(rawKey).digest("hex");
}

/**
 * Check if the current time (in the recipient's timezone) falls in quiet hours.
 * quietHoursStart/End are "HH:mm" strings, e.g. "22:00" / "08:00".
 */
export function isInQuietHours(start: string, end: string, timezone: string): boolean {
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


/**
 * Replace `{{variableName}}` placeholders in a template string.
 * Returns null if the input template is null/undefined.
 */
export function renderTemplate(
    template: string | null | undefined,
    variables?: Record<string, string>
): string | null {
    if (!template) return null;
    if (!variables) return template;

    return template.replace(/\{\{(\w+)\}\}/g, (match, key) => {
        return variables[key] !== undefined ? variables[key] : match;
    });
}

export type NotificationStatus = "PENDING" | "QUEUED" | "PROCESSING" | "SENT" | "DELIVERED" | "FAILED" | "CANCELLED";

export type NotificationChannel = "EMAIL" | "SMS" | "PUSH";
