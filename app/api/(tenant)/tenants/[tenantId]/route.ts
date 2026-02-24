import { NextResponse, NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

export async function GET(request: NextRequest, { params }: { params: { tenantId: string } }) {
    try {
        const session = await auth();
        if(!session || !session.user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const tenantId = params.tenantId;
        const tenant = await prisma.tenant.findUnique({
            where: {
                id: tenantId,
                ownerId: session.user.id,
            },
        });

        if (!tenant) {
            return NextResponse.json({ error: "Tenant not found or access denied" }, { status: 404 });
        }

        return NextResponse.json({ tenant }, { status: 200 });
    } catch (error) {
        console.error("Error fetching tenant:", error);
        return NextResponse.json({ error: "Failed to fetch tenant" }, { status: 500 });
    }
}

export async function PUT(request: NextRequest, { params }: { params: { tenantId: string }}){
    try {
        const session = await auth();
        if(!session || !session.user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const tenantId = params.tenantId;
        const tenant =await prisma.tenant.findFirst({
            where: {
                id: tenantId,
                ownerId: session.user.id,
            }
        });
        if (!tenant) {
            return NextResponse.json({ error: "Unauthorized or tenant not found" },{ status: 404 });
        }

        const updatedTenant = await prisma.tenant.update({
            where: {
                id: tenantId,
            },
            data: {
                name: tenant.name,
                webhookUrl: tenant.webhookUrl,
                plan: tenant.plan,
            }
        });

        return NextResponse.json({ tenant: updatedTenant }, { status: 200 });
        
    } catch (error) {
        console.error("Error updating tenant:", error);
        return NextResponse.json({ error: "Failed to update tenant" }, { status: 500 });
    }
}

export async function DELETE(request: NextRequest, { params }: { params: { tenantId: string }}){
    try {
        const session = await auth();
        if(!session || !session.user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const tenantId = params.tenantId;
        const tenant =await prisma.tenant.findFirst({
            where: {
                id: tenantId,
                ownerId: session.user.id,
            }
        });
        if(!tenant) {
            return NextResponse.json({ error: "Unauthorized or tenant not found" },{ status: 404 });
        }
        
        await prisma.tenant.delete({
            where: {
                id: tenantId,
            }
        });
        return NextResponse.json({ message: "Tenant deleted successfully" }, { status: 200 });
    } catch (error) {
        console.error("Error deleting tenant:", error);
        return NextResponse.json({ error: "Failed to delete tenant" }, { status: 500 });
    }
}