import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

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

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const context = await resolveTenantContext(session.user.id, (session.user as any).tenantId as string | undefined);
    if (!context || (context.membership.role !== "OWNER" && context.membership.role !== "ADMIN")) {
      return NextResponse.json({ error: "Only OWNER or ADMIN can revoke API keys" }, { status: 403 });
    }

    const { tenantId } = context;

    const { id } = await params;
    const body = await request.json();

    if (body?.action !== "revoke") {
      return NextResponse.json({ error: "Unsupported action" }, { status: 400 });
    }

    const existing = await prisma.apiKey.findUnique({ where: { id } });
    if (!existing || existing.tenantId !== tenantId) {
      return NextResponse.json({ error: "API key not found" }, { status: 404 });
    }

    const updated = await prisma.apiKey.update({
      where: { id },
      data: { status: "REVOKED" },
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

    return NextResponse.json({ apiKey: updated }, { status: 200 });
  } catch (error) {
    console.error("Error revoking API key:", error);
    return NextResponse.json({ error: "Failed to revoke API key" }, { status: 500 });
  }
}
