import React from 'react'
import ReactDOM from 'react-dom'
import App from './containers/App'
import ObjectMultiplex from 'obj-multiplex'
import PortStream from 'extension-port-stream'
import EventEmitter from 'eventemitter3'
import Dnode from 'dnode/browser'
import extension from 'extensionizer'
import pump from 'pump'
import buildPromisedBackgroundApi from '@pegasus/utils/promised-background-api'

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
  }
})

engineStream.pipe(backgroundDnode).pipe(engineStream)

backgroundDnode.once('remote', async backgroundConnection => {
  const background = buildPromisedBackgroundApi(backgroundConnection)
  background.on = eventEmitter.on.bind(eventEmitter)

  ReactDOM.render(
    <App background={background} />,
    document.getElementById('root')
  )
})

//when the UI will be refactored, redux will be used and background will be used only within actions
