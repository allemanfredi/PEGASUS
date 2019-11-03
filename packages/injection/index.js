import Duplex from '@pegasus/utils/duplex'
import EventChannel from '@pegasus/utils/event-channel'
import extensionizer from 'extensionizer'

const injection = {
  eventChannel: new EventChannel('content-script'),
  duplex: new Duplex.Tab(),

  init () {
    console.log('Initialising Pegasus')
    this.registerListeners()
    this.inject()
  },

  registerListeners () {
    this.eventChannel.on('tunnel', async data => {
      try {
        this.eventChannel.send(
          'tabReply',
          await this.duplex.send('tabRequest', data)
        )
      } catch (ex) {
        console.log('Tab request failed:', ex)
      }
    })

    this.duplex.on('tunnel', ({ action, data }) => {
      this.eventChannel.send(action, data)
    })
  },

  inject () {
    const injectionSite = document.head || document.documentElement
    const container = document.createElement('script')

    container.src = extensionizer.extension.getURL('dist/hook.js')
    container.onload = function () {
      this.parentNode.removeChild(this)
    }

    injectionSite.insertBefore(
      container,
      injectionSite.children[0]
    )

    console.log('Pegasus injected')
  }
}

injection.init()
