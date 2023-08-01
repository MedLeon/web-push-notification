self.addEventListener("push", function (event) {
  const notification = event.data?.json();
  console.log("notification", notification);
  event.waitUntil(
    self.registration.showNotification(notification.title, notification.options)
  );
});


self.addEventListener("notificationclick", (e) => {
  // Close the notification popout
  e.notification.close();
  // Get all the Window clients
  e.waitUntil(
    clients.matchAll({ type: "window" }).then((clientsArr) => {
      // If a Window tab matching the targeted URL already exists, focus that;
      const hadWindowToFocus = clientsArr.some((windowClient) =>
        windowClient.url === e.notification.data.url
          ? (windowClient.focus(), true)
          : false,
      );
      // Otherwise, open a new tab to the applicable URL and focus it.
      if (!hadWindowToFocus)
        clients
          .openWindow(e.notification.data.url)
          .then((windowClient) => (windowClient ? windowClient.focus() : null));
    }),
  );
});


// BrowserPetsWorker.js
// self.addEventListener("notificationclick", async function (event) {
//   console.log("event", event);
//   if (!event.action && !event.notification.data.url) return;
//   // This always opens a new browser tab, / even if the URL happens to already be open in a tab.
//   console.log("event.action", event.action);
//   console.log("event.notification.data.url", event.notification.data.url);
//   const url = event.action || event.notification.data.url;
//   console.log(url)
//   clients.openWindow(url);
// });
