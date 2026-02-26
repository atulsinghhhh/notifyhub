import twilio from "twilio";
import type { NotificationProvider, SendParams, SendResult } from "./types";

const accountSid = process.env.TWILIO_ACCOUNT_SID || "";
const authToken = process.env.TWILIO_AUTH_TOKEN || "";
const fromNumber = process.env.TWILIO_PHONE_NUMBER || "";

// Lazy-init: only create the client when actually needed
let _client: ReturnType<typeof twilio> | null = null;
function getClient() {
    if (!_client) {
        if (!accountSid || !authToken) {
            throw new Error("Twilio credentials not configured (TWILIO_ACCOUNT_SID / TWILIO_AUTH_TOKEN)");
        }
        _client = twilio(accountSid, authToken);
    }
    return _client;
}

export const twilioProvider: NotificationProvider = {
    name: "twilio",

    async send(params: SendParams): Promise<SendResult> {
        try {
            console.log(`[Twilio] Sending SMS to: ${params.to} from: ${fromNumber}`);
            const client = getClient();
            const message = await client.messages.create({
                to: params.to,
                from: fromNumber,
                body: params.body,
            });
            console.log(`[Twilio] Success! SID: ${message.sid}`);

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
