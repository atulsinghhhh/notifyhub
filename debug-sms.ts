
import { prisma } from "./lib/prisma";

async function debugSms() {
    try {
        console.log("--- Latest 5 SMS Notifications ---");
        const notifications = await prisma.notification.findMany({
            where: { channel: "SMS" },
            orderBy: { createdAt: "desc" },
            take: 5,
            include: {
                deliveryLogs: true,
                recipient: true
            }
        });

        if (notifications.length === 0) {
            console.log("No SMS notifications found.");
            return;
        }

        notifications.forEach((n, i) => {
            console.log(`\n[${i + 1}] ID: ${n.id}`);
            console.log(`    Status: ${n.status}`);
            console.log(`    Recipient: ${n.recipient?.phone || "N/A"}`);
            console.log(`    Created: ${n.createdAt.toISOString()}`);
            console.log("    Logs:");
            n.deliveryLogs.forEach(log => {
                console.log(`      - [${log.eventType}] ${log.timestamp.toISOString()}: ${log.response}`);
            });
        });
    } catch (error) {
        console.error("Debug failed:", error);
    } finally {
        await prisma.$disconnect();
    }
}

debugSms();
