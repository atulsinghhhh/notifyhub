import Mailgun from "mailgun.js";
import FormData from "form-data";
import type { NotificationProvider, SendParams, SendResult } from "./types";

const mailgun = new Mailgun(FormData);

// Lazy-init: only create the client when actually needed
let _mg: any = null;
function getMgClient() {
    if (!_mg) {
        const apiKey = process.env.MAILGUN_API_KEY;
        if (!apiKey) {
            throw new Error("Mailgun API key not configured (MAILGUN_API_KEY)");
        }
        _mg = mailgun.client({
            username: "api",
            key: apiKey,
        });
    }
    return _mg;
}

const DOMAIN = process.env.MAILGUN_DOMAIN || "";
const FROM = process.env.MAILGUN_FROM || `NotifyHub <noreply@${DOMAIN}>`;

export const mailgunProvider: NotificationProvider = {
    name: "mailgun",

    async send(params: SendParams): Promise<SendResult> {
        try {
            const mg = getMgClient();
            const result = await mg.messages.create(DOMAIN, {
                from: FROM,
                to: [params.to],
                subject: params.subject || "Notification",
                html: params.body,
            });

            return {
                success: true,
                providerName: "mailgun",
                statusCode: result.status || 200,
                response: result.id || result.message,
            };
        } catch (error: any) {
            return {
                success: false,
                providerName: "mailgun",
                statusCode: error.status || 500,
                error: error.message || "Mailgun send failed",
            };
        }
    },
};
