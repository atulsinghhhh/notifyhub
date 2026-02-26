import { NextResponse, NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { authenticateRequest, isDualAuthError } from "@/lib/auth-dual";

// GET /api/analytics/templates?days=30
// Returns template usage stats (how many notifications each template was used for)
export async function GET(request: NextRequest) {
    try {
        const authResult = await authenticateRequest(request);
        if (isDualAuthError(authResult)) return authResult;
        const { tenantId } = authResult;

        const { searchParams } = new URL(request.url);
        const days = parseInt(searchParams.get("days") || "30");

        const since = new Date();
        since.setUTCDate(since.getUTCDate() - days);
        since.setUTCHours(0, 0, 0, 0);

        // Get all templates for the tenant with a count of notifications
        const templates = await prisma.notificationTemplate.findMany({
            where: { tenantId },
            select: {
                id: true,
                name: true,
                channel: true,
                _count: {
                    select: {
                        notifications: {
                            where: {
                                createdAt: { gte: since },
                            },
                        },
                    },
                },
                notifications: {
                    where: { createdAt: { gte: since } },
                    orderBy: { createdAt: "desc" },
                    take: 1,
                    select: { createdAt: true },
                },
            },
            orderBy: { createdAt: "desc" },
        });

        const result = templates
            .map((t) => ({
                id: t.id,
                name: t.name,
                channel: t.channel,
                usageCount: t._count.notifications,
                lastUsed: t.notifications[0]?.createdAt?.toISOString() ?? null,
            }))
            .sort((a, b) => b.usageCount - a.usageCount);

        return NextResponse.json({ templates: result });
    } catch (error) {
        console.error("Analytics templates error:", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}
