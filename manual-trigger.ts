
import * as dotenv from "dotenv";
dotenv.config();
console.log("DATABASE_URL present:", !!process.env.DATABASE_URL);
if (process.env.DATABASE_URL) {
    console.log("DATABASE_URL starts with:", process.env.DATABASE_URL.substring(0, 20));
}
import { prisma } from "./lib/prisma";
import { getProvider } from "./lib/providers";

async function manualTrigger() {
    try {
        console.log("Looking for QUEUED SMS notifications...");
        const n = await prisma.notification.findFirst({
            where: { channel: "SMS", status: "QUEUED" },
            include: { recipient: true }
        });

        if (!n) {
            console.log("No QUEUED SMS notifications found.");
            return;
        }

        console.log(`Found notification ${n.id}. Status: ${n.status}`);
        console.log(`To: ${n.recipient?.phone}`);

        if (!n.recipient?.phone) {
            console.log("Error: Recipient has no phone number.");
            return;
        }

        console.log("Attempting to send via Twilio...");
        const provider = getProvider("SMS");
        const result = await provider.send({
            to: n.recipient.phone,
            body: n.body,
            subject: n.subject
        });

        console.log("Result:", JSON.stringify(result, null, 2));

        if (result.success) {
            await prisma.notification.update({
                where: { id: n.id },
                data: { status: "SENT", sentAt: new Date() }
            });
            console.log("Database updated to SENT.");
        } else {
            console.log("Send failed.");
        }

    } catch (err: any) {
        console.error("Manual trigger failed:", err.message);
    } finally {
        await prisma.$disconnect();
    }
}

manualTrigger();
