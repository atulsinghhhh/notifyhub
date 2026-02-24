import { PrismaClient } from "../app/generated/prisma/client";

/**
 * Event-driven aggregation processor.
 *
 * Called immediately after a DeliveryLog is written in the worker.
 * Uses upsert to atomically increment the correct counter in DeliveryAggregate
 * based on the event type.
 */

type EventType = "QUEUED" | "SENT" | "DELIVERED" | "BOUNCED" | "OPENED" | "CLICKED" | "FAILED" | "RETRIED";

// Maps DeliveryEventType → DeliveryAggregate column to increment
const EVENT_TO_COLUMN: Partial<Record<EventType, string>> = {
    SENT: "totalSent",
    DELIVERED: "totalDelivered",
    FAILED: "totalFailed",
    BOUNCED: "totalBounced",
    OPENED: "totalOpened",
    CLICKED: "totalClicked",
};

/**
 * Updates the DeliveryAggregate table when a delivery event occurs.
 * Uses upsert to create or increment the daily aggregate row.
 *
 * @param prisma - Prisma client instance
 * @param tenantId - The tenant this notification belongs to
 * @param channel - Notification channel (EMAIL, SMS, PUSH)
 * @param eventType - The delivery event type (SENT, FAILED, etc.)
 */
export async function updateAggregate(
    prisma: PrismaClient,
    tenantId: string,
    channel: string,
    eventType: EventType
): Promise<void> {
    const column = EVENT_TO_COLUMN[eventType];

    // Only aggregate countable events (skip QUEUED, RETRIED)
    if (!column) return;

    // Today's date at midnight UTC
    const today = new Date();
    today.setUTCHours(0, 0, 0, 0);

    try {
        await prisma.deliveryAggregate.upsert({
            where: {
                tenantId_channel_date: {
                    tenantId,
                    channel: channel as any,
                    date: today,
                },
            },
            create: {
                tenantId,
                channel: channel as any,
                date: today,
                [column]: 1,
            },
            update: {
                [column]: { increment: 1 },
            },
        });
    } catch (error) {
        // Non-critical — log and continue, don't break the worker
        console.error(`[AGGREGATE] Failed to update aggregate for ${tenantId}/${channel}/${eventType}:`, error);
    }
}
