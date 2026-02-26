import { NextResponse, NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { authenticateRequest, isDualAuthError } from "@/lib/auth-dual";

// Get a single notification by ID
export async function GET(request: NextRequest, { params }: { params: Promise<{ notificationId: string }> }) {
    try {
        const { notificationId } = await params;
        const authResult = await authenticateRequest(request);
        if (isDualAuthError(authResult)) return authResult;
        const { tenantId } = authResult;

        const notification = await prisma.notification.findFirst({
            where: {
                id: notificationId,
                tenantId,
            },
        });

        if (!notification) {
            return NextResponse.json({ error: "Notification not found" }, { status: 404 });
        }

        return NextResponse.json(notification);
    } catch (error) {
        console.error("Get Notification Error:", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}