import { Resend } from "resend";
import type { NotificationProvider, SendParams, SendResult } from "./types";

let _client: Resend | null = null;
function getClient(): Resend {
    if (!_client) {
        const apiKey = process.env.RESEND_API_KEY;
        if (!apiKey) {
            throw new Error("Resend API key not configured (RESEND_API_KEY)");
        }
        _client = new Resend(apiKey);
    }
    return _client;
}

const FROM = process.env.RESEND_FROM || "NotifyHub <onboarding@resend.dev>";

export const resendProvider: NotificationProvider = {
    name: "resend",

    async send(params: SendParams): Promise<SendResult> {
        try {
            console.log(`[Resend] Sending email to: ${params.to}`);
            const client = getClient();
            const { data, error } = await client.emails.send({
                from: FROM,
                to: [params.to],
                subject: params.subject || "Notification",
                html: params.body,
            });

            if (error) {
                console.error(`[Resend] Error:`, error);
                return {
                    success: false,
                    providerName: "resend",
                    statusCode: 400,
                    error: error.message || "Resend send failed",
                };
            }

            console.log(`[Resend] Success! ID: ${data?.id}`);
            return {
                success: true,
                providerName: "resend",
                statusCode: 200,
                response: `ID: ${data?.id}`,
            };
        } catch (error: any) {
            return {
                success: false,
                providerName: "resend",
                statusCode: error.status || 500,
                error: error.message || "Resend send failed",
            };
        }
    },
};
