import { NextResponse,NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { hashAPIKey } from "@/lib/utilis";
import { createRecipientSchema } from "@/lib/zod/recipientsSchema";

export async function POST(request: NextRequest) {
    try {
        
        const apikeyHeader = request.headers.get("x-api-key");
        if(!apikeyHeader){
            return NextResponse.json({ error: "API key missing" }, { status: 401 });
        }

        const hashedKey = hashAPIKey(apikeyHeader);
        const apiKey = await prisma.apiKey.findUnique({
            where: { keyHash: hashedKey },
        });
        console.log("API Key:", apiKey);
        if(!apiKey || apiKey.status !== "ACTIVE"){ 
            return NextResponse.json({ error: "Invalid API key" }, { status: 401 });
        }

        const tenantId = apiKey.tenantId;
        const body = await request.json();
        const { externalId, name, email, phone, fcmToken, metadata, platform } = createRecipientSchema.parse(body);

        if(email){
            const exisitingEmail = await prisma.recipient.findUnique({
                where: {
                    tenantId_email: {
                        tenantId,
                        email
                    }
                }
            });
            if(exisitingEmail){
                return NextResponse.json({ error: "Email already exists" }, { status: 400 });
            }
        }
        if(phone){
            const exisitingPhone = await prisma.recipient.findUnique({
                where: {
                    tenantId_phone: {
                        tenantId,
                        phone
                    }
                }
            });
            if(exisitingPhone){
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

// export async function GET(){
//     try {
//         const recipients = await prisma.recipient.findMany({

//         })
//     } catch (error) {
        
//     }
// }