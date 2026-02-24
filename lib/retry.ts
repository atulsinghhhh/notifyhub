
export function calculateBackoff(retryCount: number) {
    const baseDelay = 60 * 1000; 
    return baseDelay * Math.pow(2, retryCount - 1);
}