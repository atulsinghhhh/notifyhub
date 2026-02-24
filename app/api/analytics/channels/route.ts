import { NextResponse, NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { authenticateApiKey, isAuthError } from "@/lib/auth-api-key";

// GET /api/analytics/channels
// Returns per-channel breakdown of notification stats
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

        const aggregates = await prisma.deliveryAggregate.findMany({
            where: {
                tenantId,
                date: { gte: since },
            },
        });

        // Group by channel
        const channelMap: Record<string, {
            totalSent: number;
            totalDelivered: number;
            totalFailed: number;
            totalBounced: number;
            totalOpened: number;
            totalClicked: number;
        }> = {};

        for (const row of aggregates) {
            if (!channelMap[row.channel]) {
                channelMap[row.channel] = {
                    totalSent: 0,
                    totalDelivered: 0,
                    totalFailed: 0,
                    totalBounced: 0,
                    totalOpened: 0,
                    totalClicked: 0,
                };
            }
            const ch = channelMap[row.channel];
            ch.totalSent += row.totalSent;
            ch.totalDelivered += row.totalDelivered;
            ch.totalFailed += row.totalFailed;
            ch.totalBounced += row.totalBounced;
            ch.totalOpened += row.totalOpened;
            ch.totalClicked += row.totalClicked;
        }

        const channels = Object.entries(channelMap).map(([channel, stats]) => ({
            channel,
            ...stats,
            deliveryRate: stats.totalSent > 0
                ? `${((stats.totalDelivered / stats.totalSent) * 100).toFixed(2)}%`
                : "0.00%",
        }));

        return NextResponse.json({
            period: { days, since: since.toISOString() },
            channels,
        });
    } catch (error) {
        console.error("Analytics channels error:", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}
