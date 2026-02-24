import { NextResponse, NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { hashAPIKey } from "@/lib/utilis";
import { createRecipientSchema } from "@/lib/zod/recipientsSchema";
import { auth } from "@/lib/auth";

export async function POST(request: NextRequest) {
    try {

        const apikeyHeader = request.headers.get("x-api-key");
        if (!apikeyHeader) {
            return NextResponse.json({ error: "API key missing" }, { status: 401 });
        }

        const hashedKey = hashAPIKey(apikeyHeader);
        const apiKey = await prisma.apiKey.findUnique({
            where: { keyHash: hashedKey },
        });
        console.log("API Key:", apiKey);
        if (!apiKey || apiKey.status !== "ACTIVE") {
            return NextResponse.json({ error: "Invalid API key" }, { status: 401 });
        }

        const tenantId = apiKey.tenantId;
        const body = await request.json();
        const { externalId, name, email, phone, fcmToken, metadata, platform } = createRecipientSchema.parse(body);

        if (email) {
            const exisitingEmail = await prisma.recipient.findUnique({
                where: {
                    tenantId_email: {
                        tenantId,
                        email
                    }
                }
            });
            if (exisitingEmail) {
                return NextResponse.json({ error: "Email already exists" }, { status: 400 });
            }
        }
        if (phone) {
            const exisitingPhone = await prisma.recipient.findUnique({
                where: {
                    tenantId_phone: {
                        tenantId,
                        phone
                    }
                }
            });
            if (exisitingPhone) {
                return NextResponse.json({ error: "Phone already exists" }, { status: 400 });
            }
        }

        const recipient = await prisma.$transaction(async (tx) => {
            const newRecipient = await tx.recipient.create({
                data: {
                    tenantId,
                    externalId,
                    name,
                    email,
                    phone,
                    metadata,
                },
            });

            if (fcmToken) {
                await tx.deviceToken.create({
                    data: {
                        recipientId: newRecipient.id,
                        token: fcmToken,
                        platform: body.platform || "WEB",
                    },
                });
            }

            return newRecipient;
        });

        const channels = [];
        if (email) channels.push("EMAIL");
        if (phone) channels.push("SMS");
        if (fcmToken) channels.push("PUSH");

        return NextResponse.json({ recipient, channels }, { status: 201 });

    } catch (error) {
        console.error("Error creating recipient:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}

export async function GET(request: NextRequest) {
    try {
        const session = await auth();
        if (!session || !session.user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const tenantId = session.user.tenantId;
        if (!tenantId) {
            return NextResponse.json({ error: "No tenant associated" }, { status: 403 });
        }

        const { searchParams } = new URL(request.url);
        const page = parseInt(searchParams.get("page") || "1");
        const limit = Math.min(parseInt(searchParams.get("limit") || "20"), 100);
        const search = searchParams.get("search") || undefined;

        const where: any = { tenantId };

        // Optional text search across name, email, phone
        if (search) {
            where.OR = [
                { name: { contains: search, mode: "insensitive" } },
                { email: { contains: search, mode: "insensitive" } },
                { phone: { contains: search } },
                { externalId: { contains: search } },
            ];
        }

        const [recipients, total] = await Promise.all([
            prisma.recipient.findMany({
                where,
                select: {
                    id: true,
                    externalId: true,
                    name: true,
                    email: true,
                    phone: true,
                    timezone: true,
                    locale: true,
                    createdAt: true,
                    updatedAt: true,
                },
                skip: (page - 1) * limit,
                take: limit,
                orderBy: { createdAt: "desc" },
            }),
            prisma.recipient.count({ where }),
        ]);

        return NextResponse.json({
            recipients,
            pagination: {
                page,
                limit,
                total,
                totalPages: Math.ceil(total / limit),
            },
        }, { status: 200 });
    } catch (error) {
        console.error("Error listing recipients:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}