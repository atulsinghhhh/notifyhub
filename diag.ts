
import { prisma } from "./lib/prisma";

async function diagnose() {
    try {
        console.log("=== All Recipients ===");
        const recipients = await prisma.recipient.findMany({
            select: { id: true, phone: true, email: true, name: true }
        });
        recipients.forEach(r => console.log(`ID: ${r.id} | Name: ${r.name} | Phone: ${r.phone} | Email: ${r.email}`));

        console.log("\n=== Latest SMS Notifications ===");
        const notifications = await prisma.notification.findMany({
            where: { channel: "SMS" },
            orderBy: { createdAt: "desc" },
            take: 10
        });

        for (const n of notifications) {
            console.log(`\nNotification ID: ${n.id} | Status: ${n.status} | Recipient: ${n.recipientId} | Created: ${n.createdAt}`);
            const logs = await prisma.deliveryLog.findMany({
                where: { notificationId: n.id },
                orderBy: { timestamp: "asc" }
            });
            logs.forEach(l => console.log(`  - [${l.eventType}] ${l.response}`));
        }
    } catch (err: any) {
        console.error("DIAGNOSIS ERROR:", err.message);
        if (err.stack) console.error(err.stack);
    } finally {
        await prisma.$disconnect();
    }
}

diagnose();
