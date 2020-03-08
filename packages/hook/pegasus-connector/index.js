import randomUUID from 'uuid/v4'

class PegasusConnector {
  constructor(eventChannel) {
    this.eventChannel = eventChannel
    this.calls = {}

    this.send = this.send.bind(this)

    this.bindListener()
  }

  bindListener() {
    this.eventChannel.on('tabReply', ({ success, data, uuid }) => {
      if (success) this.calls[uuid].resolve(data)
      else this.calls[uuid].reject(data)

      delete this.calls[uuid]
    })
  }

  send(action, data = {}) {
    const uuid = randomUUID()
    const origin = this.getOrigin()
    const favicon = this.getFavicon()
    const hostname = this.getHostName()
    const website = {
      favicon,
      origin,
      hostname
    }

    this.eventChannel.send('tunnel', {
      website,
      action,
      data,
      uuid
    })

    return new Promise((resolve, reject) => {
      this.calls[uuid] = {
        resolve,
        reject
      }
    })
  }

  getOrigin() {
    return location.origin
  }

  getHostName() {
    return window.location.hostname
  }

  getFavicon() {
    let favicon = document.querySelector('head > link[rel="shortcut icon"]')
    if (favicon) return favicon.href

    favicon = Array.from(
      document.querySelectorAll('head > link[rel="icon"]')
    ).find(favicon => Boolean(favicon.href))
    if (favicon) {
      return favicon.href
    }
  }
}

export default PegasusConnector
