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
import { v4 as uuidv4 } from 'uuid'

import './styles/styles.css'
import 'react-tabs/style/react-tabs.css'

const extensionPort = extension.runtime.connect({ name: 'popup' })
const connectionStream = new PortStream(extensionPort)
const mux = new ObjectMultiplex()
pump(connectionStream, mux, connectionStream, err => {
  if (err) console.error(err)
})

const engineStream = mux.createStream('engine')
const clientStream = mux.createStream('client')

const eventEmitter = new EventEmitter()
const backgroundDnode = Dnode({
  sendUpdate: state => {
    console.log(state)
    eventEmitter.emit('update', state)
  }
})

engineStream.pipe(backgroundDnode).pipe(engineStream)

backgroundDnode.once('remote', async backgroundConnection => {
  const calls = {}

  const background = {
    on: eventEmitter.on.bind(eventEmitter),
    send: data => {
      const uuid = uuidv4()
      clientStream.write(
        Object.assign(
          {},
          {
            uuid,
            ...data
          }
        )
      )

      return new Promise((resolve, reject) => {
        calls[uuid] = {
          resolve,
          reject
        }
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
