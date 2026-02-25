import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { hashAPIKey } from "@/lib/utilis";
import { auth } from "@/lib/auth";

export interface DualAuthResult {
    tenantId: string;
}

/**
 * Authenticate a request via API key or session.
 * - If `x-api-key` header is present, validates the API key.
 * - Otherwise, falls back to NextAuth session and resolves tenantId via TenantMember.
 * Returns `{ tenantId }` on success, or a NextResponse error.
 */
export async function authenticateRequest(
    request: NextRequest
): Promise<DualAuthResult | NextResponse> {
    const apiKeyHeader = request.headers.get("x-api-key");

    if (apiKeyHeader) {
        // API key auth path
        const hashedKey = hashAPIKey(apiKeyHeader);
        const apiKey = await prisma.apiKey.findUnique({
            where: { keyHash: hashedKey },
        });

        if (!apiKey || apiKey.status !== "ACTIVE") {
            return NextResponse.json({ error: "Invalid API key" }, { status: 401 });
        }

        if (apiKey.expiresAt && apiKey.expiresAt < new Date()) {
            return NextResponse.json({ error: "API key has expired" }, { status: 401 });
        }

        // Fire-and-forget lastUsedAt update
        prisma.apiKey.update({ where: { id: apiKey.id }, data: { lastUsedAt: new Date() } }).catch(() => { });

        return { tenantId: apiKey.tenantId };
    }

    // Session auth fallback (for dashboard)
    const session = await auth();
    if (!session?.user) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const membership = await prisma.tenantMember.findFirst({
        where: { userId: session.user.id },
        select: { tenantId: true },
    });

    if (!membership) {
        return NextResponse.json({ error: "No tenant membership found" }, { status: 403 });
    }

    return { tenantId: membership.tenantId };
}

/** Type guard to check if authenticateRequest returned an error response */
export function isDualAuthError(result: DualAuthResult | NextResponse): result is NextResponse {
    return result instanceof NextResponse;
}
