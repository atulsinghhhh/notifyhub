import { NextResponse, NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { authenticateRequest, isDualAuthError } from "@/lib/auth-dual";

// POST — Add a device token to a recipient
export async function POST(request: NextRequest, { params }: { params: Promise<{ recipients: string }> }) {
    try {
        const authResult = await authenticateRequest(request);
        if (isDualAuthError(authResult)) return authResult;
        const { tenantId } = authResult;

        const { recipients } = await params;
        const recipientId = recipients;

        // Verify recipient belongs to this tenant
        const recipient = await prisma.recipient.findFirst({
            where: { id: recipientId, tenantId },
        });
        if (!recipient) {
            return NextResponse.json({ error: "Recipient not found" }, { status: 404 });
        }

        const { token, platform } = await request.json();

        if (!token) {
            return NextResponse.json({ error: "token is required" }, { status: 400 });
        }

        const validPlatforms = ["IOS", "ANDROID", "WEB"];
        const devicePlatform = platform && validPlatforms.includes(platform) ? platform : "WEB";

        // Upsert: if this exact token already exists for this recipient, update it
        const device = await prisma.deviceToken.upsert({
            where: {
                recipientId_token: { recipientId, token },
            },
            create: {
                recipientId,
                token,
                platform: devicePlatform,
                isActive: true,
            },
            update: {
                platform: devicePlatform,
                isActive: true,
                updatedAt: new Date(),
            },
        });

        return NextResponse.json({ device }, { status: 201 });
    } catch (error) {
        console.error("Error adding device token:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}

// GET — List all device tokens for a recipient
export async function GET(request: NextRequest, { params }: { params: Promise<{ recipients: string }> }) {
    try {
        const authResult = await authenticateRequest(request);
        if (isDualAuthError(authResult)) return authResult;
        const { tenantId } = authResult;

        const { recipients } = await params;
        const recipientId = recipients;

        // Verify recipient belongs to this tenant
        const recipient = await prisma.recipient.findFirst({
            where: { id: recipientId, tenantId },
        });
        if (!recipient) {
            return NextResponse.json({ error: "Recipient not found" }, { status: 404 });
        }

        const devices = await prisma.deviceToken.findMany({
            where: { recipientId },
            orderBy: { createdAt: "desc" },
        });

        return NextResponse.json({ devices });
    } catch (error) {
        console.error("Error listing device tokens:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}

// DELETE — Remove a specific device token
export async function DELETE(request: NextRequest, { params }: { params: Promise<{ recipients: string }> }) {
    try {
        const authResult = await authenticateRequest(request);
        if (isDualAuthError(authResult)) return authResult;
        const { tenantId } = authResult;

        const { recipients } = await params;
        const recipientId = recipients;

        // Verify recipient belongs to this tenant
        const recipient = await prisma.recipient.findFirst({
            where: { id: recipientId, tenantId },
        });
        if (!recipient) {
            return NextResponse.json({ error: "Recipient not found" }, { status: 404 });
        }

        const { token } = await request.json();

        if (!token) {
            return NextResponse.json({ error: "token is required" }, { status: 400 });
        }

        const device = await prisma.deviceToken.findFirst({
            where: { recipientId, token },
        });

        if (!device) {
            return NextResponse.json({ error: "Device token not found" }, { status: 404 });
        }

        await prisma.deviceToken.delete({ where: { id: device.id } });

        return NextResponse.json({ message: "Device token removed successfully" });
    } catch (error) {
        console.error("Error removing device token:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
