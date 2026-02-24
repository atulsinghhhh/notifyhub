import admin from "firebase-admin";
import type { NotificationProvider, SendParams, SendResult } from "./types";

// Initialize Firebase Admin SDK (only once)
if (!admin.apps.length) {
    admin.initializeApp({
        credential: admin.credential.cert({
            projectId: process.env.FIREBASE_PROJECT_ID,
            clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
            privateKey: (process.env.FIREBASE_PRIVATE_KEY || "").replace(/\\n/g, "\n"),
        }),
    });
}

export const firebaseProvider: NotificationProvider = {
    name: "firebase",

    async send(params: SendParams): Promise<SendResult> {
        try {
            // params.to = FCM device token
            const response = await admin.messaging().send({
                token: params.to,
                notification: {
                    title: params.subject || "Notification",
                    body: params.body,
                },
                data: params.metadata
                    ? Object.fromEntries(
                        Object.entries(params.metadata).map(([k, v]) => [k, String(v)])
                    )
                    : undefined,
            });

            return {
                success: true,
                providerName: "firebase",
                statusCode: 200,
                response: `Message ID: ${response}`,
            };
        } catch (error: any) {
            return {
                success: false,
                providerName: "firebase",
                statusCode: error.code ? 400 : 500,
                error: error.message || "Firebase push failed",
            };
        }
    },
};
