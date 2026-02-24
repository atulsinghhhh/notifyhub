import { NextResponse, NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { authenticateApiKey, isAuthError } from "@/lib/auth-api-key";

// GET /api/analytics/timeline
// Returns daily time-series data for charting
export async function GET(request: NextRequest) {
    try {
        const authResult = await authenticateApiKey(request);
        if (isAuthError(authResult)) return authResult;
        const { tenantId } = authResult;

        const { searchParams } = new URL(request.url);
        const days = parseInt(searchParams.get("days") || "30");
        const channel = searchParams.get("channel") || undefined; // optional filter

        const since = new Date();
        since.setUTCDate(since.getUTCDate() - days);
        since.setUTCHours(0, 0, 0, 0);

        const where: any = {
            tenantId,
            date: { gte: since },
        };
        if (channel) {
            where.channel = channel;
        }

        const aggregates = await prisma.deliveryAggregate.findMany({
            where,
            orderBy: { date: "asc" },
        });

        // Group by date, summing across channels if no channel filter
        const dateMap: Record<string, {
            date: string;
            totalSent: number;
            totalDelivered: number;
            totalFailed: number;
            totalBounced: number;
            totalOpened: number;
            totalClicked: number;
        }> = {};

        for (const row of aggregates) {
            const dateKey = row.date.toISOString().split("T")[0]; // YYYY-MM-DD
            if (!dateMap[dateKey]) {
                dateMap[dateKey] = {
                    date: dateKey,
                    totalSent: 0,
                    totalDelivered: 0,
                    totalFailed: 0,
                    totalBounced: 0,
                    totalOpened: 0,
                    totalClicked: 0,
                };
            }
            const d = dateMap[dateKey];
            d.totalSent += row.totalSent;
            d.totalDelivered += row.totalDelivered;
            d.totalFailed += row.totalFailed;
            d.totalBounced += row.totalBounced;
            d.totalOpened += row.totalOpened;
            d.totalClicked += row.totalClicked;
        }

        const timeline = Object.values(dateMap);

        return NextResponse.json({
            period: { days, since: since.toISOString(), channel: channel || "ALL" },
            timeline,
        });
    } catch (error) {
        console.error("Analytics timeline error:", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}
