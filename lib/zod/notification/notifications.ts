import { z } from "zod";

export const notificationSchema = z.object({
    recipientId: z.string().optional(),
    email: z.string().email().optional(),
    phone: z.string().optional(),
    channel: z.enum(["EMAIL", "SMS", "PUSH"]),
    templateId: z.string().optional(),
    subject: z.string().optional(),
    body: z.string().optional(),
    variables: z.record(z.string(), z.string()).optional(),
    idempotencyKey: z.string().optional(),
    priority: z.enum(["LOW", "NORMAL", "HIGH", "CRITICAL"]).optional().default("NORMAL"),
    scheduledAt: z.string().datetime().optional(),
}).refine((data) => data.recipientId || data.email || data.phone, {
    message: "At least one of recipientId, email, or phone is required",
    path: ["recipientId"],
});

export type NotificationInput = z.infer<typeof notificationSchema>;

export const bulkNotificationSchema = z.object({
    notifications: z
        .array(notificationSchema)
        .min(1, "At least one notification is required")
        .max(1000, "Maximum 1000 notifications per batch"),
});

export type BulkNotificationInput = z.infer<typeof bulkNotificationSchema>;