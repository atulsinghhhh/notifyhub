import twilio from "twilio";
import type { NotificationProvider, SendParams, SendResult } from "./types";

const accountSid = process.env.TWILIO_ACCOUNT_SID || "";
const authToken = process.env.TWILIO_AUTH_TOKEN || "";
const fromNumber = process.env.TWILIO_PHONE_NUMBER || "";

const client = twilio(accountSid, authToken);

export const twilioProvider: NotificationProvider = {
    name: "twilio",

    async send(params: SendParams): Promise<SendResult> {
        try {
            const message = await client.messages.create({
                to: params.to,
                from: fromNumber,
                body: params.body,
            });

            return {
                success: true,
                providerName: "twilio",
                statusCode: 200,
                response: `SID: ${message.sid}, Status: ${message.status}`,
            };
        } catch (error: any) {
            return {
                success: false,
                providerName: "twilio",
                statusCode: error.status || 500,
                error: error.message || "Twilio send failed",
            };
        }
    },
};
