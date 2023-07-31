self.addEventListener("push", function (event) {
  const notification = event.data?.json();
  if (event.data) {
    self.registration.showNotification(
      notification.title,
      notification.options
    );
  }
});
