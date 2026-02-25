import { z } from 'zod';

// Helper: treat empty strings as undefined so .optional() works with form inputs
const emptyToUndefined = (val: string) => (val === "" ? undefined : val);

export const createRecipientSchema = z.object({
    name: z.string().min(3, "Recipient name too short").max(100, "Recipient name too long"),
    email: z.preprocess(emptyToUndefined, z.string().email("Invalid email address").optional()),
    phone: z.preprocess(
        emptyToUndefined,
        z.string()
            .regex(/^[6-9]\d{9}$/, "Phone must be a valid 10-digit Indian mobile number")
            .optional()
    ),
    fcmToken: z.preprocess(emptyToUndefined, z.string().optional()),
    externalId: z.preprocess(emptyToUndefined, z.string().max(100, "External ID too long").optional()),
    metadata: z.any().optional(),
    platform: z.enum(["ANDROID", "IOS", "WEB"]).optional()
}).refine((data) => data.email || data.phone || data.fcmToken, {
    message: "At least one contact method (email, phone, or fcmToken) must be provided",
});

