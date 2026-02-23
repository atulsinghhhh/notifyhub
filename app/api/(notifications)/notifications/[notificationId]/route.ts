import { NextResponse, NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { authenticateApiKey, isAuthError } from "@/lib/auth-api-key";

// Get a single notification by ID
export async function GET(request: NextRequest, { params }: { params: { notificationId: string } }) {
    try {
        const authResult = await authenticateApiKey(request);
        if (isAuthError(authResult)) return authResult;
        const { tenantId } = authResult;

        const notification = await prisma.notification.findFirst({
            where: {
                id: params.notificationId,
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