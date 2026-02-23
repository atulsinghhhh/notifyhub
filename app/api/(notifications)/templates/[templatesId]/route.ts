import { NextResponse,NextRequest } from "next/server";
import { auth } from "@/lib/auth"; 
import { prisma } from "@/lib/prisma";
import { notificationTemplateSchema } from "@/lib/zod/notification/templates";

export async function GET(request: NextRequest, { params }: { params: { templatesId: string } }) {
    try {
        const session = await auth();
        if(!session || !session.user){
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const tenantId = session.user.tenantId;
        const template = await prisma.notificationTemplate.findUnique({
            where: {
                id: params.templatesId,
                tenantId,
            }
        });

        if(!template){
            return NextResponse.json({ error: "Template not found" }, { status: 404 });
        }

        return NextResponse.json({ template }, { status: 200 });
    } catch (error) {
        console.log("Error fetching template", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}

export async function PUT(request: NextRequest, { params }: { params: { templatesId: string } }) {
    try {
        const session = await auth();
        if(!session || !session.user){
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const tenantId = session.user.tenantId;
        const template = await prisma.notificationTemplate.findUnique({
            where: {
                id: params.templatesId,
                tenantId,
            }
        });

        if(!template){
            return NextResponse.json({ error: "Template not found" }, { status: 404 });
        }

        const bodies = await request.json();
        const { name, channel, body, subject, metadata } = notificationTemplateSchema.parse(bodies);

        const updatedTemplate = await prisma.notificationTemplate.update({
            where: {
                id: params.templatesId,
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
export async function DELETE(request: NextRequest, { params }: { params: { templatesId: string } }) {
    try {
        const session = await auth();
        if(!session || !session.user){
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const tenantId = session.user.tenantId;
        const template = await prisma.notificationTemplate.findUnique({
            where: {
                id: params.templatesId,
                tenantId,
            }
        });

        if(!template){
            return NextResponse.json({ error: "Template not found" }, { status: 404 });
        }

        await prisma.notificationTemplate.delete({
            where: {
                id: params.templatesId,
                tenantId,
            }
        });
        return NextResponse.json({ template: template.id }, { status: 200 });
    } catch (error) {
        console.log("Error deleting template", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}