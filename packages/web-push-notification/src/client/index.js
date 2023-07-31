import wokerUrl from "./sw.js?worker&url";

/** @param {{ applicationServerKey }} input
 * @returns {Promise<string>}
 */
export async function newSubscription(input) {
  const swURL = new URL(
    import.meta.env.DEV ? "./sw.js" : wokerUrl,
    import.meta.url
  );
  let sw = await navigator.serviceWorker.register(swURL);
  // let sw = await navigator.serviceWorker.register(wokerUrl);
  return JSON.stringify(
    await sw.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: input.applicationServerKey,
    })
  );
}
