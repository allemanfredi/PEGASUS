import React from 'react'
import ReactDOM from 'react-dom'
import App from './containers/App'
import ObjectMultiplex from 'obj-multiplex'
import PortStream from 'extension-port-stream'
import EventEmitter from 'eventemitter3'
import Dnode from 'dnode/browser'
import extension from 'extensionizer'
import pump from 'pump'
import buildPromisedBackgroundApi from '@pegasus/utils/promised-api'

import './styles/styles.css'

const extensionPort = extension.runtime.connect({ name: 'popup' })
const connectionStream = new PortStream(extensionPort)
const mux = new ObjectMultiplex()
pump(connectionStream, mux, connectionStream, err => {
  if (err) {
    console.error(err)
  }
})

const engineStream = mux.createStream('engine')
const eventEmitter = new EventEmitter()
const backgroundDnode = Dnode({
  sendUpdate: state => {
    eventEmitter.emit('update', state)
    console.log('2', state)
  }
})

engineStream.pipe(backgroundDnode).pipe(engineStream)

backgroundDnode.once('remote', async backgroundConnection => {
  //backgroundConnection.on = eventEmitter.on.bind(eventEmitter)
  //cb(null, backgroundConnection)

  const backgroundMessanger = buildPromisedBackgroundApi(backgroundConnection)

  //backgroundConnection is the API object
  console.log(await backgroundMessanger.isWalletSetup())
  console.log(await backgroundMessanger.unlockWallet('hello'))
  console.log(await backgroundMessanger.getCurrentNetwork())
})

ReactDOM.render(<App />, document.getElementById('root'))
