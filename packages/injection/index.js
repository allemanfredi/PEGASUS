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
  const extensionPort = extension.runtime.connect({ name: 'pegasusContentScript' })
  const extensionStream = new PortStream(extensionPort)

  const pageMux = new ObjectMultiplex()
  pageMux.setMaxListeners(25)
  const extensionMux = new ObjectMultiplex()
  extensionMux.setMaxListeners(25)
  
  pump(
    pageMux,
    contentScriptStream,
    pageMux,
    (err) => logStreamDisconnectWarning('Pegasus Inpage Multiplex', err)
  )
  pump(
    extensionMux,
    extensionStream,
    extensionMux,
    (err) => logStreamDisconnectWarning('Pegasus Background Multiplex', err)
  )

  const pageChannel = pageMux.createStream('inpageClient')
  const extensionChannel = extensionMux.createStream('inpageClient')

  pump(
    pageChannel,
    extensionChannel,
    pageChannel,
    (err) => logStreamDisconnectWarning('Pegasus traffic lost to inpageClient', err)
  )
}


const logStreamDisconnectWarning = (remoteLabel, err) => {
  let warningMsg = `PegasusContentscript - lost connection to ${remoteLabel}`
  if (err) {
    warningMsg += '\n' + err.stack
  }
  console.warn(warningMsg)
}


setupStreams()
inject()