import Mailgun from "mailgun.js";
import FormData from "form-data";
import type { NotificationProvider, SendParams, SendResult } from "./types";

const mailgun = new Mailgun(FormData);

const mg = mailgun.client({
    username: "api",
    key: process.env.MAILGUN_API_KEY || "",
});

const DOMAIN = process.env.MAILGUN_DOMAIN || "";
const FROM = process.env.MAILGUN_FROM || `NotifyHub <noreply@${DOMAIN}>`;

export const mailgunProvider: NotificationProvider = {
    name: "mailgun",

    async send(params: SendParams): Promise<SendResult> {
        try {
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
