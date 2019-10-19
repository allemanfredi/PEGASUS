const extension = require('extensionizer')

class NotificationsService {

  showNotification (title, message, url) {
    extension.notifications.create(
      url,
      {
        'type': 'basic',
        'title': title,
        'iconUrl': '../../../../images/pegasus-64.png',
        'message': message,
      })
  }
}

export default NotificationsService