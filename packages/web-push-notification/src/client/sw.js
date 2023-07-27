self.addEventListener('push', function(event) {
    if (event.data) {
      showLocalNotification('Yolo', event.data.text(), self.registration)
    } 
  })
  const showLocalNotification = (title, body, swRegistration) => {
    const options = {
      body,
      // here you can add more properties like icon, image, vibrate, etc.
    }
    swRegistration.showNotification(title, options)
  }