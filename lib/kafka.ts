import { Kafka, Producer } from "kafkajs";

const kafka = new Kafka({
    clientId: "notifyhub",
    brokers: (process.env.KAFKA_BROKERS || "localhost:9092").split(","),
});

let producer: Producer | null = null;

async function getProducer(): Promise<Producer> {
    if (!producer) {
        producer = kafka.producer();
        await producer.connect();
    }
    return producer;
}

export const TOPICS = {
    NOTIFICATION_SEND: "notification.send",
} as const;


/** Publish a single notification ID to the send queue */
export async function publishNotification(notificationId: string) {
    const p = await getProducer();
    await p.send({
        topic: TOPICS.NOTIFICATION_SEND,
        messages: [{ key: notificationId, value: JSON.stringify({ notificationId }) }],
    });
}

/** Publish multiple notification IDs in a single batch */
export async function publishNotificationBatch(notificationIds: string[]) {
    const p = await getProducer();
    await p.send({
        topic: TOPICS.NOTIFICATION_SEND,
        messages: notificationIds.map((id) => ({
            key: id,
            value: JSON.stringify({ notificationId: id }),
        })),
    });
}

/** Graceful shutdown */
export async function disconnectProducer() {
    if (producer) {
        await producer.disconnect();
        producer = null;
    }
}
