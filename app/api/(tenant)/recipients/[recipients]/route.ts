import { NextResponse,NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

export async function GET(request: NextRequest, { params }: { params: Promise<{ recipients: string }> }){
    try {
        const session = await auth();
        if(!session || !session.user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { recipients } = await params;
        const recipientId = recipients;
        const recipient = await prisma.recipient.findUnique({
            where: {
                id: recipientId,
            }
        })
        if(!recipient){
            return NextResponse.json({ error: "Recipient not found" }, { status: 404 });
        }
        return NextResponse.json({ recipient }, {status: 200 });
    } catch (error) {
        console.error("Error fetching recipient:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }

}

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ recipients: string }> }){
    try {
        const session = await auth();
        if(!session || !session.user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { recipients } = await params;
        const recipientId = recipients;
        const recipient = await prisma.recipient.findUnique({
            where: {
                id: recipientId,
            }
        })
        if(!recipient){
            return NextResponse.json({ error: "Recipient not found" }, { status: 404 });
        }

        const { email, phone, timezone, locale } = await request.json();
        const updatedRecipient = await prisma.recipient.update({
            where: {
                id: recipientId,
            },
            data: {
                email,
                phone,
                timezone,
                locale
            }
        });

        return NextResponse.json({ recipient: updatedRecipient } , { status: 200 });
    } catch (error) {
        console.error("Error updating recipient:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ recipients: string }> }){
    try {
        // Remove recipient from platform.
        // Used For:
        // GDPR compliance
        // User account deletion
        // Business cleanup
        // Flow:
        // Validate API key
        // Verify tenant ownership
        // Delete recipient
        // Cascade delete related:
        // Device tokens
        // Preferences
        const session = await auth();
        if(!session || !session.user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }
        const { recipients } = await params;
        const recipientId = recipients;
        const recipient = await prisma.recipient.findUnique({
            where: {
                id: recipientId,
            }
        })
        if(!recipient){
            return NextResponse.json({ error: "Recipient not found" }, { status: 404 });
        }
        await prisma.recipient.delete({
            where: {
                id: recipientId,
            }
        })
        return NextResponse.json({ message: "Recipient deleted successfully" }, { status: 200 });
    } catch (error) {
        console.error("Error deleting recipient:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}