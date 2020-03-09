import extensionizer from 'extensionizer'

class NotificationsController {
  showNotification(_title, _message, _url) {
    extensionizer.notifications.create(_url, {
      type: 'basic',
      title: _title,
      iconUrl: '../../../../images/pegasus-64.png',
      message: _message
    })
  }
}

export default NotificationsController
