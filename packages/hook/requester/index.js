import randomUUID from 'uuid/v4'

const requester = {
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
    const origin = this._getOrigin()

    this.eventChannel.send('tunnel', {
      origin,
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

  _getOrigin() {
    return location.origin
  }
}

export default requester
