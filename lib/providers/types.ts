export interface SendParams {
    to: string;
    subject?: string | null;
    body: string;
    metadata?: Record<string, unknown>;
}

export interface SendResult {
    success: boolean;
    providerName: string;
    statusCode?: number;
    response?: string;
    error?: string;
}

export interface NotificationProvider {
    name: string;
    send(params: SendParams): Promise<SendResult>;
}
