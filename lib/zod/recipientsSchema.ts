import { z } from 'zod';

export const createRecipientSchema = z.object({
    name: z.string().min(3, "Recipient name too short").max(100, "Recipient name too long"),
    email: z.string().email("Invalid email address").optional(),
    phone: z.string().regex(/^\+\d{8,15}$/).optional(),
    fcmToken: z.string().optional(),
    externalId: z.string().max(100, "External ID too long").optional(),
    metadata:  z.any().optional(),
    platform: z.enum(["ANDROID", "IOS", "WEB"]).optional()
}).refine((data) => data.email || data.phone || data.fcmToken, {
    message: "At least one contact method (email, phone, or fcmToken) must be provided",
});