import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { generateAPIKEY, hashAPIKey } from "@/lib/utilis";

async function resolveTenantContext(userId: string, sessionTenantId?: string) {
  if (sessionTenantId) {
    const membership = await prisma.tenantMember.findUnique({
      where: {
        tenantId_userId: {
          tenantId: sessionTenantId,
          userId,
        },
      },
    });

    if (membership) {
      return { tenantId: sessionTenantId, membership };
    }
  }

  const fallbackMembership = await prisma.tenantMember.findFirst({
    where: { userId },
    orderBy: { joinedAt: "asc" },
  });

  if (!fallbackMembership) {
    return null;
  }

  return { tenantId: fallbackMembership.tenantId, membership: fallbackMembership };
}

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const context = await resolveTenantContext(session.user.id, (session.user as any).tenantId as string | undefined);
    if (!context) {
      return NextResponse.json({ error: "Access denied" }, { status: 403 });
    }

    const { tenantId } = context;

    const apiKeys = await prisma.apiKey.findMany({
      where: { tenantId },
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        name: true,
        prefix: true,
        status: true,
        scopes: true,
        expiresAt: true,
        lastUsedAt: true,
        createdAt: true,
      },
    });

    return NextResponse.json({ apiKeys }, { status: 200 });
  } catch (error) {
    console.error("Error fetching API keys:", error);
    return NextResponse.json({ error: "Failed to fetch API keys" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const context = await resolveTenantContext(session.user.id, (session.user as any).tenantId as string | undefined);
    if (!context || (context.membership.role !== "OWNER" && context.membership.role !== "ADMIN")) {
      return NextResponse.json({ error: "Only OWNER or ADMIN can create API keys" }, { status: 403 });
    }

    const { tenantId } = context;

    const body = await request.json();
    const name = typeof body?.name === "string" && body.name.trim() ? body.name.trim() : "API Key";
    const scopes = Array.isArray(body?.scopes) && body.scopes.length > 0
      ? body.scopes.filter((scope: unknown) => typeof scope === "string")
      : ["notifications:send"];

    const rawApiKey = generateAPIKEY();
    const keyHash = hashAPIKey(rawApiKey);
    const prefix = rawApiKey.slice(0, 8);

    const apiKey = await prisma.apiKey.create({
      data: {
        tenantId,
        name,
        keyHash,
        prefix,
        scopes,
        status: "ACTIVE",
      },
      select: {
        id: true,
        name: true,
        prefix: true,
        status: true,
        scopes: true,
        expiresAt: true,
        lastUsedAt: true,
        createdAt: true,
      },
    });

    return NextResponse.json({ apiKey, rawApiKey }, { status: 201 });
  } catch (error) {
    console.error("Error creating API key:", error);
    return NextResponse.json({ error: "Failed to create API key" }, { status: 500 });
  }
}
