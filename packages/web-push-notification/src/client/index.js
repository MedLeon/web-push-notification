import wokerUrl from "./sw.js?worker&url";

let sw = null;

/** @param {{ applicationServerKey }} input
 * @returns {Promise<string>}
 */
export async function newSubscription(input) {
  console.log("new");
  //   let sw = await navigator.serviceWorker.ready;
  console.log("sw", sw);
  // let sw = await navigator.serviceWorker.register(wokerUrl);
  return JSON.stringify(
    await sw.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: input.applicationServerKey,
    })
  );
}

addEventListener("load", async () => {
  const swURL = new URL(
    import.meta.env.DEV ? "./sw.js" : wokerUrl,
    import.meta.url
  );
  sw = await navigator.serviceWorker.register(swURL);
  console.log("sw", sw);
});
