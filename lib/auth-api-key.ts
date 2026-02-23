import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { hashAPIKey } from "@/lib/utilis";

export interface AuthResult {
    tenantId: string;
    apiKeyId: string;
}

/**
 * Authenticate an API request via `x-api-key` header.
 *
 * Validates the key is ACTIVE, not expired, and has the required scope.
 * Returns the tenantId + apiKeyId on success, or an error NextResponse.
 */
export async function authenticateApiKey(
    request: NextRequest,
    requiredScope: string = "notifications:send"
): Promise<AuthResult | NextResponse> {
    const apiKey = request.headers.get("x-api-key");
    if (!apiKey) {
        return NextResponse.json({ error: "Missing x-api-key header" }, { status: 401 });
    }

    const keyHash = hashAPIKey(apiKey);
    const record = await prisma.apiKey.findUnique({ where: { keyHash } });

    if (!record) {
        return NextResponse.json({ error: "Invalid API key" }, { status: 401 });
    }

    if (record.status !== "ACTIVE") {
        return NextResponse.json({ error: "API key is not active" }, { status: 401 });
    }

    if (record.expiresAt && record.expiresAt < new Date()) {
        return NextResponse.json({ error: "API key has expired" }, { status: 401 });
    }

    if (!record.scopes.includes(requiredScope)) {
        return NextResponse.json(
            { error: `API key missing required scope: ${requiredScope}` },
            { status: 403 }
        );
    }

    // Update lastUsedAt (fire-and-forget)
    prisma.apiKey.update({ where: { id: record.id }, data: { lastUsedAt: new Date() } }).catch(() => { });

    return { tenantId: record.tenantId, apiKeyId: record.id };
}

/** Type guard to check if authenticateApiKey returned an error response */
export function isAuthError(result: AuthResult | NextResponse): result is NextResponse {
    return result instanceof NextResponse;
}
