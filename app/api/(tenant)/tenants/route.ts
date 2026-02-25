import { NextResponse, NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { createTenantSchema } from "@/lib/zod/tenantsSchema";
import { generateUniqueSlug, generateAPIKEY, hashAPIKey } from "@/lib/utilis";

export async function POST(request: NextRequest) {
    try {
        const session = await auth();
        if (!session || !session.user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const userId = session.user.id;

        const body = await request.json();
        const { name, plan, webhookUrl } = createTenantSchema.parse(body);

        const slug = await generateUniqueSlug(name);
        const rawAPIKey = generateAPIKEY();
        const keyHash = hashAPIKey(rawAPIKey);
        const prefix = rawAPIKey.slice(0, 8);

        const result = await prisma.$transaction(async (tx) => {
            const newTenant = await tx.tenant.create({
                data: {
                    name,
                    slug,
                    plan,
                    webhookUrl,
                    ownerId: userId,
                },
            });

            // Create TenantMember with OWNER role for the creating user
            await tx.tenantMember.create({
                data: {
                    userId,
                    tenantId: newTenant.id,
                    role: "OWNER",
                },
            });

            await tx.apiKey.create({
                data: {
                    tenantId: newTenant.id,
                    name: "Default Key",
                    keyHash,
                    prefix,
                    scopes: ["notifications:send"],
                    status: "ACTIVE",
                },
            });

            return { tenant: newTenant, rawAPIKey };
        });

        return NextResponse.json({ message: "Tenant created successfully", tenant: result.tenant, apiKey: result.rawAPIKey }, { status: 201 });

    } catch (error) {
        console.error("Error creating tenant:", error);
        return NextResponse.json({ error: "Failed to create tenant" }, { status: 500 });
    }
}

export async function GET() {
    try {
        const session = await auth();
        if (!session || !session.user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }
        const userId = session.user.id;
        if (!userId) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        // Fetch all tenants the user is a member of via the join table
        const memberships = await prisma.tenantMember.findMany({
            where: { userId },
            include: { tenant: true },
        });

        const tenants = memberships.map((m) => ({
            ...m.tenant,
            role: m.role,
            joinedAt: m.joinedAt,
        }));

        return NextResponse.json({ tenants }, { status: 200 });

    } catch (error) {
        console.error("Error fetching tenants:", error);
        return NextResponse.json({ error: "Failed to fetch tenants" }, { status: 500 });
    }
}