import React from 'react'
import ReactDOM from 'react-dom'
import App from './containers/App'
import ObjectMultiplex from 'obj-multiplex'
import PortStream from 'extension-port-stream'

import './styles/styles.css'

const extensionPort = extension.runtime.connect({ name: 'popup' })
const connectionStream = new PortStream(extensionPort)
const mux = new ObjectMultiplex()
  pump(
    connectionStream,
    mux,
    connectionStream,
    (err) => {
      if (err) {
        console.error(err)
      }
    }
  )

ReactDOM.render(<App />, document.getElementById('root'))
