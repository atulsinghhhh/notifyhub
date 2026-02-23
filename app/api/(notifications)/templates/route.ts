import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { notificationTemplateSchema } from "@/lib/zod/notification/templates";
import { prisma } from "@/lib/prisma";

export async function POST(request: NextRequest) {
    try {
        const session = await auth();
        if (!session?.user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const tenantId = session.user.tenantId;
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

        return NextResponse.json({ template: template.id } , {status: 201});
    } catch (error) {
        console.log("Error creating template", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}

export async function GET(request: NextRequest) {
    try {
        const session = await auth();
        if(!session || !session.user){
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const tenantId = session.user.tenantId;
        const templates = await prisma.notificationTemplate.findMany({
            where: {
                tenantId,
            }
        });

        return NextResponse.json({ templates }, { status: 200 });
    } catch (error) {
        console.log("Error fetching templates", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}