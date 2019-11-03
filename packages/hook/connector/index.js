import randomUUID from 'uuid/v4'

const connector = {
  init (eventChannel) {
    this.eventChannel = eventChannel
    this.calls = {}

    this.bindListener()
    return this.handler.bind(this)
  },

  bindListener () {
    this.eventChannel.on('tabReply', ({ success, data, uuid }) => {
      if (success)
        this.calls[uuid].resolve(data)
      else this.calls[uuid].reject(data)

      delete this.calls[uuid]
    })
  },

  handler (action, data = {}) {
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
  },

  getOrigin() {
    return location.origin
  },

  getHostName() {
    return window.location.hostname
  },

  getFavicon() {
    let favicon = null
    const nodeList = document.getElementsByTagName('link')
    for (let i = 0; i < nodeList.length; i++) {
      if ((nodeList[i].getAttribute('rel') == 'icon') || (nodeList[i].getAttribute('rel') == 'shortcut icon')) {
        favicon = nodeList[i].getAttribute('href')
      }
    }
    return favicon
  }
}

export default connector
