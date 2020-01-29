import extensionizer from 'extensionizer'

class NotificationsController {
  showNotification(title, message, url) {
    extensionizer.notifications.create(url, {
      type: 'basic',
      title: title,
      iconUrl: '../../../../images/pegasus-64.png',
      message: message
    })
  }
}

export default NotificationsController
