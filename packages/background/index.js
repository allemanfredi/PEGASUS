import extension from 'extensionizer'
import PortStream from 'extension-port-stream'
import PegasusEngine from './pegasus-engine'
import ObjectMultiplex from 'obj-multiplex'
import logger from '@pegasus/utils/logger'
import pump from 'pump'

const engine = new PegasusEngine()

extension.runtime.onConnect.addListener(port => handleConnection(port))

const handleConnection = port => {
  if (port.name === 'popup') {
    const portStream = new PortStream(port)
    // communication with popup

    const mux = new ObjectMultiplex()
    pump(portStream, mux, portStream, err => {
      if (err) {
        logger.error(err)
      }
    })

    engine.setupEngineConnectionWithPopup(mux.createStream('engine'))
    return
  }

  if (port.sender && port.sender.tab && port.sender.url) {
    port.onMessage.addListener(msg => {
      if (msg.data && msg.data.method === 'connect') {
        //this.engine.connect(uuid, resolve, website)
      }
    })

    const portStream = new PortStream(port)
    const mux = new ObjectMultiplex()
    pump(portStream, mux, portStream, err => {
      if (err) {
        logger.error(err)
      }
    })

    // messages between inpage and background
    engine.setupInpageClientConnection(
      mux.createStream('inpageClient'),
      port.sender
    )
  }
}
