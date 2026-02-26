
import { prisma } from "./lib/prisma";

async function diagnose() {
    try {
        console.log("=== Checking SMS Notifications ===");
        const smsNotifications = await prisma.notification.findMany({
            where: { channel: "SMS" },
            orderBy: { createdAt: "desc" },
            take: 20
        });

        if (smsNotifications.length === 0) {
            console.log("No SMS notifications found.");
            return;
        }

        for (const n of smsNotifications) {
            console.log(`\nID: ${n.id} | Status: ${n.status} | Phone: ${n.recipientId || "NONE"}`);
            const logs = await prisma.deliveryLog.findMany({
                where: { notificationId: n.id },
                orderBy: { timestamp: "asc" }
            });
            logs.forEach(l => console.log(`  - [${l.eventType}] ${l.response}`));
        }
    } catch (err: any) {
        console.error("DIAGNOSIS ERROR:", err.message);
    } finally {
        await prisma.$disconnect();
    }
}

diagnose();
