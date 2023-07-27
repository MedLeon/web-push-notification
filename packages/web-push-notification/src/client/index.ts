export async function newSubscription(input: { applicationServerKey: string }) {
  const swURL = new URL("./sw.js", import.meta.url);
  let sw = await navigator.serviceWorker.register(swURL);
  return JSON.stringify(await sw.pushManager.subscribe({
    userVisibleOnly: true,
    applicationServerKey: input.applicationServerKey,
  }));
}
