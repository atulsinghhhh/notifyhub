import { NextResponse, NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { authenticateApiKey, isAuthError } from "@/lib/auth-api-key";

// GET /api/analytics/summary
// Returns overall notification stats for the tenant
export async function GET(request: NextRequest) {
    try {
        const authResult = await authenticateApiKey(request);
        if (isAuthError(authResult)) return authResult;
        const { tenantId } = authResult;

        const { searchParams } = new URL(request.url);
        const days = parseInt(searchParams.get("days") || "30");

        const since = new Date();
        since.setUTCDate(since.getUTCDate() - days);
        since.setUTCHours(0, 0, 0, 0);

        // Aggregate from DeliveryAggregate table
        const aggregates = await prisma.deliveryAggregate.findMany({
            where: {
                tenantId,
                date: { gte: since },
            },
        });

        const summary = {
            totalSent: 0,
            totalDelivered: 0,
            totalFailed: 0,
            totalBounced: 0,
            totalOpened: 0,
            totalClicked: 0,
        };

        for (const row of aggregates) {
            summary.totalSent += row.totalSent;
            summary.totalDelivered += row.totalDelivered;
            summary.totalFailed += row.totalFailed;
            summary.totalBounced += row.totalBounced;
            summary.totalOpened += row.totalOpened;
            summary.totalClicked += row.totalClicked;
        }

        const deliveryRate = summary.totalSent > 0
            ? ((summary.totalDelivered / summary.totalSent) * 100).toFixed(2)
            : "0.00";

        const failureRate = summary.totalSent > 0
            ? ((summary.totalFailed / summary.totalSent) * 100).toFixed(2)
            : "0.00";

        return NextResponse.json({
            period: { days, since: since.toISOString() },
            ...summary,
            deliveryRate: `${deliveryRate}%`,
            failureRate: `${failureRate}%`,
        });
    } catch (error) {
        console.error("Analytics summary error:", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}
