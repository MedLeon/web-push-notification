self.addEventListener("push", function (event) {
  const notification = event.data?.json();
  console.log("notification", notification);
  event.waitUntil(
    self.registration.showNotification(notification.title, notification.options)
  );
});

self.addEventListener("notificationclick", (e) => {
  e.notification.close();
  const actionUrl = e.action || (!!e.notification.data && e.notification.data.url) || self.location.origin; 
  if(!actionUrl) return;
  e.waitUntil(
    clients.matchAll({ type: "window" }).then((clientsArr) => {
      // If a Window tab matching the targeted URL already exists, focus that;
      const hadWindowToFocus = clientsArr.some((windowClient) =>
        windowClient.url === actionUrl
          ? (windowClient.focus(), true)
          : false,
      );
      // Otherwise, open a new tab to the applicable URL and focus it.
      if (!hadWindowToFocus)
        clients
          .openWindow(actionUrl)
          .then((windowClient) => (windowClient ? windowClient.focus() : null));
    }),
  );
});
