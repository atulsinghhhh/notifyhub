import { NextResponse, NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { authenticateRequest, isDualAuthError } from "@/lib/auth-dual";

// Get Delivery Logs for a notification
export async function GET(request: NextRequest, { params }: { params: Promise<{ notificationId: string }> }) {
    try {
        const { notificationId } = await params;
        // Step 1: Authenticate via API key or session
        const authResult = await authenticateRequest(request);
        if (isDualAuthError(authResult)) return authResult;
        const { tenantId } = authResult;

        // Step 2: Verify notification belongs to this tenant
        const notification = await prisma.notification.findFirst({
            where: {
                id: notificationId,
                tenantId,
            },
        });

        if (!notification) {
            return NextResponse.json({ error: "Notification not found" }, { status: 404 });
        }

        // Step 3: Fetch delivery logs
        const logs = await prisma.deliveryLog.findMany({
            where: { notificationId },
            orderBy: { timestamp: "asc" },
        });

        return NextResponse.json({
            notificationId,
            status: notification.status,
            logs,
        });
    } catch (error) {
        console.error("Error fetching delivery logs:", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}
