export interface ProviderResult {
    success: boolean;
    statusCode?: number;
    providerMessageId?: string;
    error?: string;
}

export interface NotificationPayload {
    to: string;
    subject?: string;
    body: string;
    metadata?: any;
}

export interface IProvider {
    send(payload: NotificationPayload): Promise<ProviderResult>;
}