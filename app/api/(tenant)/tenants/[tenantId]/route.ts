import { NextResponse, NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

export async function GET(request: NextRequest, { params }: { params: Promise<{ tenantId: string }> }) {
    try {
        const session = await auth();
        if (!session || !session.user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { tenantId } = await params;

        // Check membership via TenantMember join table
        const membership = await prisma.tenantMember.findUnique({
            where: {
                tenantId_userId: {
                    tenantId,
                    userId: session.user.id,
                },
            },
            include: { tenant: true },
        });

        if (!membership) {
            return NextResponse.json({ error: "Tenant not found or access denied" }, { status: 404 });
        }

        return NextResponse.json({ tenant: membership.tenant, role: membership.role }, { status: 200 });
    } catch (error) {
        console.error("Error fetching tenant:", error);
        return NextResponse.json({ error: "Failed to fetch tenant" }, { status: 500 });
    }
}

export async function PUT(request: NextRequest, { params }: { params: Promise<{ tenantId: string }> }) {
    try {
        const session = await auth();
        if (!session || !session.user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { tenantId } = await params;

        // Verify OWNER role via TenantMember
        const membership = await prisma.tenantMember.findUnique({
            where: {
                tenantId_userId: {
                    tenantId,
                    userId: session.user.id,
                },
            },
        });

        if (!membership || membership.role !== "OWNER") {
            return NextResponse.json({ error: "Unauthorized or tenant not found" }, { status: 403 });
        }

        const body = await request.json();

        const updatedTenant = await prisma.tenant.update({
            where: { id: tenantId },
            data: {
                name: body.name,
                webhookUrl: body.webhookUrl,
                plan: body.plan,
            }
        });

        return NextResponse.json({ tenant: updatedTenant }, { status: 200 });

    } catch (error) {
        console.error("Error updating tenant:", error);
        return NextResponse.json({ error: "Failed to update tenant" }, { status: 500 });
    }
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ tenantId: string }> }) {
    try {
        const session = await auth();
        if (!session || !session.user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { tenantId } = await params;

        // Verify OWNER role via TenantMember
        const membership = await prisma.tenantMember.findUnique({
            where: {
                tenantId_userId: {
                    tenantId,
                    userId: session.user.id,
                },
            },
        });

        if (!membership || membership.role !== "OWNER") {
            return NextResponse.json({ error: "Unauthorized or tenant not found" }, { status: 403 });
        }

        await prisma.tenant.delete({
            where: { id: tenantId },
        });
        return NextResponse.json({ message: "Tenant deleted successfully" }, { status: 200 });
    } catch (error) {
        console.error("Error deleting tenant:", error);
        return NextResponse.json({ error: "Failed to delete tenant" }, { status: 500 });
    }
}