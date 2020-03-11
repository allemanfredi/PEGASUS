import PegasusInpageClient from './pegasus-inpage-client'
import PostMessageStream from 'post-message-stream'

const inpageStream = new PostMessageStream({
  name: 'pegasusInpage',
  target: 'pegasusContentScript'
})

const pegasusInpageClient = new PegasusInpageClient(inpageStream)

const proxiedPegasusInpageClient = new Proxy(pegasusInpageClient, {
  deleteProperty: () => true
})

window.iota = proxiedPegasusInpageClient
