import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { notificationTemplateSchema } from "@/lib/zod/notification/templates";
import { prisma } from "@/lib/prisma";

/**
 * Helper: resolve tenantId from the logged-in user's membership.
 */
async function resolveTenant(userId: string) {
    const membership = await prisma.tenantMember.findFirst({
        where: { userId },
        select: { tenantId: true },
    });
    return membership?.tenantId ?? null;
}

export async function POST(request: NextRequest) {
    try {
        const session = await auth();
        if (!session?.user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const tenantId = await resolveTenant(session.user.id);
        if (!tenantId) {
            return NextResponse.json({ error: "Missing or unauthorized tenantId" }, { status: 403 });
        }

        const bodies = await request.json();
        const { name, channel, body, subject, metadata } = notificationTemplateSchema.parse(bodies);

        const template = await prisma.notificationTemplate.create({
            data: {
                tenantId,
                name,
                channel,
                body,
                subject,
                metadata,
            }
        });

        return NextResponse.json({ template: template.id }, { status: 201 });
    } catch (error) {
        console.log("Error creating template", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}

export async function GET(request: NextRequest) {
    try {
        const session = await auth();
        if (!session || !session.user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const tenantId = await resolveTenant(session.user.id);
        if (!tenantId) {
            return NextResponse.json({ error: "Missing or unauthorized tenantId" }, { status: 403 });
        }

        const templates = await prisma.notificationTemplate.findMany({
            where: {
                tenantId,
            },
            include: {
                _count: {
                    select: { notifications: true },
                },
            },
        });

        return NextResponse.json({ templates }, { status: 200 });
    } catch (error) {
        console.log("Error fetching templates", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}