import crypto from "crypto";
import { generateSlug } from "./zod/tenantsSchema";
import { prisma } from "./prisma";

export async function generateUniqueSlug(name: string){
    const baseSlug = generateSlug(name);
    let slug = baseSlug;
    let cnt = 1;

    while(true){
        const existing = await prisma.tenant.findUnique({ where: { slug } });
        if(!existing) break;
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