import { prisma } from "@/lib/prisma";
// import { getProvider } from "@/lib/providers";
import { calculateBackoff } from "@/lib/retry";

export async function processNotification(notificationId: string) {
    // Fetch notification from DB
    const notification = await prisma.notification.findUnique({
        where: { id: notificationId },
    })

    if(!notification){
        return { error: "Notification not found" };
    }

    if(notification.status !== "PENDING" && notification.status !== "FAILED"){
        return { error: "Notification is not in a processable state" };
    }

    const updatedNotification = await prisma.notification.updateMany({
        where: {
            id: notificationId,
            status: notification.status
        },
        data: {
            status: "PROCESSING",
        }
    });

    if(updatedNotification.count === 0){
        return { error: "Notification is already being processed by another worker" };
    }

    const provider = getProvider(notification.channel);
    const result= await provider.send(notification);

    if(result.success){
        await prisma.notification.update({
            where: { id: notificationId },
            data: { status: "SENT", sentAt: new Date() },
        });

        await prisma.deliveryLog.create({
            data: {
                notificationId,
                eventType: "SENT",
                provider: notification.channel,
                statusCode: result.statusCode,
                response: JSON.stringify(result)
            }
        })
    }
    else {
        // handle failure, retry logic, etc.
        const newRetryCount = notification.retryCount + 1;
        if(newRetryCount > notification.maxRetries){

            await prisma.deadLetterQueue.create({
                data: {
                    notificationId,
                    reason: result.error || "Max retries reached",
                    payload: notification,
                    retryable: false
                }
            })
            await prisma.notification.update({
                where: { id: notificationId },
                data: {
                    status: "FAILED",
                    retryCount: newRetryCount,
                    failedAt: new Date()
                }
            });
        }

        else {
            const delay = calculateBackoff(newRetryCount);
            const nextRetryAt = new Date(Date.now() + delay);

            await prisma.notification.update({
                where: { id: notificationId },
                data: {
                    status: "FAILED",
                    retryCount: newRetryCount,
                    nextRetryAt
                }
            });
        }

        await prisma.deliveryLog.create({
            data: {
                notificationId,
                eventType: "FAILED",
                provider: notification.channel,
                statusCode: result.statusCode,
                response: result.error
            }
        });
    }
}
