import EventEmitter from 'eventemitter3'
import randomUUID from 'uuid/v4'
import extensionizer from 'extensionizer'

class DuplexHost extends EventEmitter {
  constructor() {
    super()

    this.channels = new Map()
    this.incoming = new Map() // Incoming message replies
    this.outgoing = new Map() // Outgoing message replies

    extensionizer.runtime.onConnect.addListener(channel =>
      this.handleNewConnection(channel)
    )
  }

  handleNewConnection(channel) {
    const extensionID = channel.sender.id
    const uuid = randomUUID()

    if (extensionID !== extensionizer.runtime.id) {
      channel.disconnect()
      return console.log(`Dropped unsolicited connection from ${extensionID}`)
    }

    const {
      name,
      sender: { url }
    } = channel

    if (!this.channels.has(name)) this.emit(`${name}:connect`)

    const channelList = this.channels.get(name) || new Map()
    const hostname = new URL(url).hostname

    this.channels.set(
      name,
      channelList.set(uuid, {
        channel,
        url
      })
    )

    channel.onMessage.addListener(message =>
      this.handleMessage(name, {
        ...message,
        hostname
      })
    )

    channel.onDisconnect.addListener(() => {
      const channelList = this.channels.get(name)

      if (!channelList) return

      channelList.delete(uuid)

      if (!channelList.size) {
        this.channels.delete(name)
        this.emit(`${name}:disconnect`)
      }
    })
  }

  handleMessage(source, message) {
    const { noAck = false, hostname, messageID, action, data } = message

    if (action === 'messageReply') return this.handleReply(data)

    if (source === 'tab' && !['tabRequest'].includes(action))
      return console.log(`Droping unauthorized tab request: ${action}`, data)

    if (noAck) return this.emit(action, { hostname, data })

    this.incoming.set(messageID, res =>
      this.send(
        source,
        'messageReply',
        {
          messageID,
          ...res
        },
        false
      )
    )

    this.emit(action, {
      resolve: res => {
        if (!this.incoming.get(messageID))
          return console.log(`Message ${messageID} expired`)

        this.incoming.get(messageID)({ error: false, res })
        this.incoming.delete(messageID)
      },
      reject: res => {
        if (!this.incoming.get(messageID))
          return console.log(`Message ${messageID} expired`)

        this.incoming.get(messageID)({ error: true, res })
        this.incoming.delete(messageID)
      },
      data,
      hostname
    })
  }

  handleReply({ messageID, error, res }) {
    if (!this.outgoing.has(messageID)) return

    if (error) this.outgoing.get(messageID)(Promise.reject(res))
    else this.outgoing.get(messageID)(res)

    this.outgoing.delete(messageID)
  }

  broadcast(action, data, requiresAck = true) {
    return Promise.all(
      [...this.channels.keys()].map(channelGroup =>
        this.send(channelGroup, action, data, requiresAck)
      )
    )
  }

  send(target = false, action, data, requiresAck = true) {
    if (!this.channels.has(target)) return

    if (!requiresAck) {
      return this.channels
        .get(target)
        .forEach(({ channel }) =>
          channel.postMessage({ action, data, noAck: true })
        )
    }

    return new Promise((resolve, reject) => {
      const messageID = randomUUID()

      this.outgoing.set(messageID, resolve)

      this.channels
        .get(target)
        .forEach(({ channel }) =>
          channel.postMessage({ action, data, messageID, noAck: false })
        )
    })
  }
}

export default DuplexHost
