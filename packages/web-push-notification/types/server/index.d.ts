export function sendNotification(notification: {
    title: string;
    options?: {
        actions?: {
            action: string;
            title: string;
            icon: string;
        };
        badge?: string;
        body?: string;
        data?: any;
        dir?: string;
        icon?: string;
        image?: string;
        lang?: string;
        renotify?: boolean;
        requireInteraction?: boolean;
        silent?: boolean;
        tag?: string;
        timestamp?: number;
        vibrate?: number[];
    };
}, subscription: IPushSubscription, vapidDetails: {
    subject: string;
    publicKey: string;
    privateKey: string;
}, options?: any): Promise<Response>;
export type VapidDetails = {
    subject: string;
    publicKey: string;
    privateKey: string;
};
export type RequestDetails = {
    method: string;
    headers: {
        [key: string]: string | number;
    };
    payload: any;
    endpoint: string;
};
export type IVapidDetails = {
    subject: string;
    publicKey: string;
    privateKey: string;
};
export type IHeaders = any;
export type IOptions = {
    gcmAPIKey: string;
    vapidDetails: IVapidDetails;
    timeout: number;
    TTL: number;
    headers: IHeaders;
    contentEncoding: string;
    urgency: string;
    topic: string;
    proxy: string;
    agent: string;
};
export type IKeys = {
    p256dh: string;
    auth: string;
};
export type IPushSubscription = {
    endpoint: string;
    keys: IKeys;
};
