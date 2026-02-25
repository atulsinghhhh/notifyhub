import { NextResponse, NextRequest } from "next/server";
import bcrypt from "bcryptjs";
import { registerSchema } from "@/lib/zod/register";
import { prisma } from "@/lib/prisma";

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { email, password } = registerSchema.parse(body);

        const existingUser = await prisma.user.findUnique({
            where: { email },
        });

        if (existingUser) {
            return NextResponse.json({ error: "User already exists" }, { status: 400 });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const slug = email.split("@")[0].toLowerCase().replace(/[^a-z0-9]/g, "-") + "-" + Date.now();

        // Create User → Tenant → TenantMember → ApiKey in one transaction
        const result = await prisma.$transaction(async (tx) => {
            const user = await tx.user.create({
                data: { email, password: hashedPassword },
            });

            const tenant = await tx.tenant.create({
                data: {
                    name: `${email.split("@")[0]}'s Workspace`,
                    slug,
                    ownerId: user.id,
                },
            });

            await tx.tenantMember.create({
                data: {
                    userId: user.id,
                    tenantId: tenant.id,
                    role: "OWNER",
                },
            });

            // Auto-generate an API key
            const { randomBytes } = await import("crypto");
            const rawKey = `nhub_${randomBytes(24).toString("hex")}`;

            await tx.apiKey.create({
                data: {
                    tenantId: tenant.id,
                    key: rawKey,
                    name: "Default Key",
                    scopes: ["notifications:write", "notifications:read"],
                },
            });

            return { id: user.id, email: user.email, tenantId: tenant.id };
        });

        return NextResponse.json({ message: "Account created successfully", user: result }, { status: 201 });
    } catch (error) {
        console.error("Error during registration:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}