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
import StreamProvider from '@pegasus/utils/stream-provider'

import './styles/styles.css'
import 'react-tabs/style/react-tabs.css'

const extensionPort = extension.runtime.connect({ name: 'popup' })
const connectionStream = new PortStream(extensionPort)
const mux = new ObjectMultiplex()
pump(connectionStream, mux, connectionStream, err => {
  if (err) console.error(err)
})

const clientStream = mux.createStream('client')
const providerStream = new StreamProvider()
providerStream.pipe(clientStream).pipe(providerStream)

const engineStream = mux.createStream('engine')
const eventEmitter = new EventEmitter()
const backgroundDnode = Dnode({
  sendUpdate: state => {
    console.log(state)
    eventEmitter.emit('update', state)
  }
})

engineStream.pipe(backgroundDnode).pipe(engineStream)

backgroundDnode.once('remote', async backgroundConnection => {
  const background = {
    on: eventEmitter.on.bind(eventEmitter),
    send: data => {
      return new Promise((resolve, reject) => {
        providerStream.send(data, (err, res) => {
          if (err) reject(err)
          else resolve(res)
        })
      })
    },
    ...buildPromisedBackgroundApi(backgroundConnection)
  }

  ReactDOM.render(
    <App background={background} />,
    document.getElementById('root')
  )
})

/* I am aware that some things in this part are not the best, as I had started this project
without having any knowledge of react. when the ui will be redone practically everything
will be canceled */
