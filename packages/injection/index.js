import ObjectMultiplex from 'obj-multiplex'
import extension from 'extensionizer'
import PortStream from 'extension-port-stream'
import PostMessageStream from 'post-message-stream'
import pump from 'pump'

const inject = () => {
  const injectionSite = document.head || document.documentElement
  const container = document.createElement('script')

  container.src = extension.extension.getURL('dist/inpage-client.js')
  container.onload = function() {
    this.parentNode.removeChild(this)
  }

  injectionSite.insertBefore(container, injectionSite.children[0])
}

const setupStreams = () => {
  const contentScriptStream = new PostMessageStream({
    name: 'pegasusContentScript',
    target: 'pegasusInpage'
  })
  const extensionPort = extension.runtime.connect({
    name: 'pegasusContentScript'
  })
  const extensionStream = new PortStream(extensionPort)

  const pageMux = new ObjectMultiplex()
  pageMux.setMaxListeners(25)
  const extensionMux = new ObjectMultiplex()
  extensionMux.setMaxListeners(25)

  pump(pageMux, contentScriptStream, pageMux, err =>
    console.warn('Pegasus Inpage Multiplex Disconnected ', err || '')
  )
  pump(extensionMux, extensionStream, extensionMux, err =>
    console.warn('Pegasus Background Multiplex Disconnected ', err || '')
  )

  const pageChannel = pageMux.createStream('client')
  const extensionChannel = extensionMux.createStream('client')

  pump(pageChannel, extensionChannel, pageChannel, err =>
    console.warn('Pegasus traffic lost to client ', err || '')
  )
}

setupStreams()
inject()
