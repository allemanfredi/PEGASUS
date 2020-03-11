import Duplex from '@pegasus/utils/duplex'
import extensionizer from 'extensionizer'
import PostMessageStream from 'post-message-stream'

const contentScriptStream = new PostMessageStream({
  name: 'pegasusContentScript',
  target: 'pegasusInpage'
})

const duplex = new Duplex.Tab()

const bindStreamListeners = () => {
  contentScriptStream.on('data', async data => {
    try {
      contentScriptStream.write(await duplex.send('tabRequest', data))
    } catch (ex) {
      console.log('Tab request failed:', ex)
    }
  })

  duplex.on('tunnel', ({ action, data }) => {
    contentScriptStream.write({ action, data })
  })
}

const inject = () => {
  const injectionSite = document.head || document.documentElement
  const container = document.createElement('script')

  container.src = extensionizer.extension.getURL('dist/inpage-client.js')
  container.onload = function() {
    this.parentNode.removeChild(this)
  }

  injectionSite.insertBefore(container, injectionSite.children[0])
}

bindStreamListeners()
inject()
