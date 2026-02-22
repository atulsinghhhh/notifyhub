import { z } from "zod";

export const registerSchema = z.object({
    email: z.string().email("Invalid email address"),
    password: z.string().min(6, "Password must be at least 6 characters long"),
})

export const updateUserSchema = z.object({
    name: z.string().optional(),
    image: z.string().url("Invalid image URL").optional(),
})