import { NextResponse, NextRequest } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { notificationTemplateSchema } from "@/lib/zod/notification/templates";

/**
 * Helper: resolve tenantId from query param and verify membership.
 */
async function resolveTenant(request: NextRequest, userId: string) {
    const { searchParams } = new URL(request.url);
    const tenantId = searchParams.get("tenantId");
    if (!tenantId) return null;

    const membership = await prisma.tenantMember.findUnique({
        where: { tenantId_userId: { tenantId, userId } },
    });
    return membership ? tenantId : null;
}

export async function GET(request: NextRequest, { params }: { params: Promise<{ templatesId: string }> }) {
    try {
        const { templatesId } = await params;
        const session = await auth();
        if (!session || !session.user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const tenantId = await resolveTenant(request, session.user.id);
        if (!tenantId) {
            return NextResponse.json({ error: "Missing or unauthorized tenantId" }, { status: 403 });
        }

        const template = await prisma.notificationTemplate.findUnique({
            where: {
                id: templatesId,
                tenantId,
            }
        });

        if (!template) {
            return NextResponse.json({ error: "Template not found" }, { status: 404 });
        }

        return NextResponse.json({ template }, { status: 200 });
    } catch (error) {
        console.log("Error fetching template", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}

export async function PUT(request: NextRequest, { params }: { params: Promise<{ templatesId: string }> }) {
    try {
        const { templatesId } = await params;
        const session = await auth();
        if (!session || !session.user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const tenantId = await resolveTenant(request, session.user.id);
        if (!tenantId) {
            return NextResponse.json({ error: "Missing or unauthorized tenantId" }, { status: 403 });
        }

        const template = await prisma.notificationTemplate.findUnique({
            where: {
                id: templatesId,
                tenantId,
            }
        });

        if (!template) {
            return NextResponse.json({ error: "Template not found" }, { status: 404 });
        }

        const bodies = await request.json();
        const { name, channel, body, subject, metadata } = notificationTemplateSchema.parse(bodies);

        const updatedTemplate = await prisma.notificationTemplate.update({
            where: {
                id: templatesId,
                tenantId,
            },
            data: {
                name,
                channel,
                body,
                subject,
                metadata,
            }
        });
        return NextResponse.json({ template: updatedTemplate.id }, { status: 200 });
    } catch (error) {
        console.log("Error updating template", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
// Check Dependency
// Important production consideration:
// If template is used by:
// Existing scheduled notifications
// Options:
// Option A:
// Allow deletion freely (notifications keep rendered content).
// Option B:
// Prevent deletion if referenced.
// Best practice:
// Allow deletion because notifications store rendered body.
export async function DELETE(request: NextRequest, { params }: { params: Promise<{ templatesId: string }> }) {
    try {
        const { templatesId } = await params;
        const session = await auth();
        if (!session || !session.user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const tenantId = await resolveTenant(request, session.user.id);
        if (!tenantId) {
            return NextResponse.json({ error: "Missing or unauthorized tenantId" }, { status: 403 });
        }

        const template = await prisma.notificationTemplate.findUnique({
            where: {
                id: templatesId,
                tenantId,
            }
        });

        if (!template) {
            return NextResponse.json({ error: "Template not found" }, { status: 404 });
        }

        await prisma.notificationTemplate.delete({
            where: {
                id: templatesId,
                tenantId,
            }
        });
        return NextResponse.json({ template: template.id }, { status: 200 });
    } catch (error) {
        console.log("Error deleting template", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}