import type { NotificationProvider } from "./types";
import { mailgunProvider } from "./mailgun";
import { twilioProvider } from "./twilio";
import { firebaseProvider } from "./firebase";

const providerMap: Record<string, NotificationProvider> = {
    EMAIL: mailgunProvider,
    SMS: twilioProvider,
    PUSH: firebaseProvider,
};

/**
 * Returns the provider for the given notification channel.
 * Throws if no provider is configured for the channel.
 */
export function getProvider(channel: string): NotificationProvider {
    const provider = providerMap[channel];
    if (!provider) {
        throw new Error(`No provider configured for channel: ${channel}`);
    }
    return provider;
}

export { mailgunProvider, twilioProvider, firebaseProvider };
