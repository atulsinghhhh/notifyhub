export class EmailProvider {
    async send(notification: any) {
        try {
        // Call SendGrid API here
        // await sendgrid.send(...)

        return {
            success: true,
            statusCode: 200,
            providerMessageId: "sg_12345"
        };

        } catch (error: any) {
        return {
            success: false,
            statusCode: error.statusCode || 500,
            error: error.message
        };
        }
    }
}