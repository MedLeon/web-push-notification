/// <reference lib="dom" />

import wokerUrl from "./sw.js?worker&url";

let sw = null;

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
export async function newSubscription(applicationServerKey) {
  const ask =
    typeof applicationServerKey === "string"
      ? applicationServerKey
      : applicationServerKey.applicationServerKey;
  return JSON.stringify(
    await sw.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: ask,
    })
  );
}

addEventListener("load", async () => {
  const swURL = new URL(
    import.meta.env.DEV ? "./sw.js" : wokerUrl,
    import.meta.url
  );
  sw = await navigator.serviceWorker.register(swURL);
});
