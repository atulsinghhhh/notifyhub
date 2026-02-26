import admin from "firebase-admin";
import type { NotificationProvider, SendParams, SendResult } from "./types";

// Lazy-init: only create the client when actually needed
function initFirebase() {
    if (!admin.apps.length) {
        if (!process.env.FIREBASE_PROJECT_ID || !process.env.FIREBASE_CLIENT_EMAIL) {
            throw new Error("Firebase credentials not configured (FIREBASE_PROJECT_ID / FIREBASE_CLIENT_EMAIL)");
        }
        admin.initializeApp({
            credential: admin.credential.cert({
                projectId: process.env.FIREBASE_PROJECT_ID,
                clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
                privateKey: (process.env.FIREBASE_PRIVATE_KEY || "").replace(/\\n/g, "\n"),
            }),
        });
    }
    return admin;
}

export const firebaseProvider: NotificationProvider = {
    name: "firebase",

    async send(params: SendParams): Promise<SendResult> {
        try {
            initFirebase();
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
