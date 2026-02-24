import { NextResponse, NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { authenticateApiKey, isAuthError } from "@/lib/auth-api-key";

// POST — Create a notification preference for a recipient
export async function POST(request: NextRequest, { params }: { params: { recipients: string } }) {
    try {
        const authResult = await authenticateApiKey(request);
        if (isAuthError(authResult)) return authResult;
        const { tenantId } = authResult;

        const recipientId = params.recipients;

        // Verify recipient belongs to this tenant
        const recipient = await prisma.recipient.findFirst({
            where: { id: recipientId, tenantId },
        });
        if (!recipient) {
            return NextResponse.json({ error: "Recipient not found" }, { status: 404 });
        }

        const { channel, enabled, quietHoursStart, quietHoursEnd } = await request.json();

        if (!channel || !["EMAIL", "SMS", "PUSH"].includes(channel)) {
            return NextResponse.json({ error: "Valid channel is required (EMAIL, SMS, PUSH)" }, { status: 400 });
        }

        // Upsert: create or update preference for this channel
        const preference = await prisma.notificationPreference.upsert({
            where: {
                recipientId_channel: { recipientId, channel },
            },
            create: {
                recipientId,
                channel,
                enabled: enabled ?? true,
                quietHoursStart: quietHoursStart || null,
                quietHoursEnd: quietHoursEnd || null,
            },
            update: {
                enabled: enabled ?? true,
                quietHoursStart: quietHoursStart || null,
                quietHoursEnd: quietHoursEnd || null,
            },
        });

        return NextResponse.json({ preference }, { status: 201 });
    } catch (error) {
        console.error("Error creating preference:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}

// GET — List all preferences for a recipient
export async function GET(request: NextRequest, { params }: { params: { recipients: string } }) {
    try {
        const authResult = await authenticateApiKey(request);
        if (isAuthError(authResult)) return authResult;
        const { tenantId } = authResult;

        const recipientId = params.recipients;

        // Verify recipient belongs to this tenant
        const recipient = await prisma.recipient.findFirst({
            where: { id: recipientId, tenantId },
        });
        if (!recipient) {
            return NextResponse.json({ error: "Recipient not found" }, { status: 404 });
        }

        const preferences = await prisma.notificationPreference.findMany({
            where: { recipientId },
        });

        return NextResponse.json({ preferences });
    } catch (error) {
        console.error("Error listing preferences:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}

// PATCH — Update a specific preference
export async function PATCH(request: NextRequest, { params }: { params: { recipients: string } }) {
    try {
        const authResult = await authenticateApiKey(request);
        if (isAuthError(authResult)) return authResult;
        const { tenantId } = authResult;

        const recipientId = params.recipients;

        // Verify recipient belongs to this tenant
        const recipient = await prisma.recipient.findFirst({
            where: { id: recipientId, tenantId },
        });
        if (!recipient) {
            return NextResponse.json({ error: "Recipient not found" }, { status: 404 });
        }

        const { channel, enabled, quietHoursStart, quietHoursEnd } = await request.json();

        if (!channel) {
            return NextResponse.json({ error: "channel is required to identify the preference" }, { status: 400 });
        }

        const preference = await prisma.notificationPreference.findUnique({
            where: { recipientId_channel: { recipientId, channel } },
        });

        if (!preference) {
            return NextResponse.json({ error: "Preference not found for this channel" }, { status: 404 });
        }

        const updated = await prisma.notificationPreference.update({
            where: { id: preference.id },
            data: {
                enabled: enabled !== undefined ? enabled : preference.enabled,
                quietHoursStart: quietHoursStart !== undefined ? quietHoursStart : preference.quietHoursStart,
                quietHoursEnd: quietHoursEnd !== undefined ? quietHoursEnd : preference.quietHoursEnd,
            },
        });

        return NextResponse.json({ preference: updated });
    } catch (error) {
        console.error("Error updating preference:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}

// DELETE — Remove a preference (resets to default behavior)
export async function DELETE(request: NextRequest, { params }: { params: { recipients: string } }) {
    try {
        const authResult = await authenticateApiKey(request);
        if (isAuthError(authResult)) return authResult;
        const { tenantId } = authResult;

        const recipientId = params.recipients;

        // Verify recipient belongs to this tenant
        const recipient = await prisma.recipient.findFirst({
            where: { id: recipientId, tenantId },
        });
        if (!recipient) {
            return NextResponse.json({ error: "Recipient not found" }, { status: 404 });
        }

        const { channel } = await request.json();

        if (!channel) {
            return NextResponse.json({ error: "channel is required" }, { status: 400 });
        }

        const preference = await prisma.notificationPreference.findUnique({
            where: { recipientId_channel: { recipientId, channel } },
        });

        if (!preference) {
            return NextResponse.json({ error: "Preference not found" }, { status: 404 });
        }

        await prisma.notificationPreference.delete({ where: { id: preference.id } });

        return NextResponse.json({ message: "Preference deleted successfully" });
    } catch (error) {
        console.error("Error deleting preference:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
