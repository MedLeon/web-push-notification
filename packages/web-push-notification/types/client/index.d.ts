/// <reference lib="dom" />
/**
 * Takes your applicationServerKey and returns a stringified subscription string.
 *
 * This string can be directly used in your backend to send push notifications.
 *
 * @example
 * const stringifiedNewSubscription = await newSubscription("your-applicationServerKey");
 * await fetch('https://your-domain.com/subscribe', {body: stringifiedNewSubscription});
 *
 * @param { string } applicationServerKey - generated in step 1 (https://www.stephane-quantin.com/en/tools/generators/vapid-keys) ;
 * @returns {Promise<string>} return stringified subscription
 */
export function newSubscription(applicationServerKey: string): Promise<string>;
