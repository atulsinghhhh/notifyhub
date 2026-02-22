import { z } from "zod";

export const createTenantSchema = z.object({
    name: z
    .string()
    .min(3, "Business name too short")
    .max(100, "Business name too long"),

    plan: z.enum(["FREE", "STARTER", "ENTERPRISE", "BUSINESS"]).optional(),

    webhookUrl: z
        .string()
        .url()
        .optional()
});


export function generateSlug(name: string): string {
    return name
        .toLowerCase()
        .trim()
        .replace(/\s+/g, "-")
        .replace(/[^\w-]/g, "");
}
