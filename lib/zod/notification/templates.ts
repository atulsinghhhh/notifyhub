import { z } from "zod";

export const notificationTemplateSchema = z.object({
    name: z.string().min(1).max(100),
    channel: z.enum(["EMAIL", "SMS", "PUSH"]),
    body: z.string().min(1).max(1000),
    subject: z.string().min(1).max(100).optional(),
    metadata: z.record(z.string(), z.any()).optional(),
});
