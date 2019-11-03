class LedgerController {

  constructor() {
    this.bridgeUrl = 'https://allemanfredi.github.io/pegasus-ledger-trampoline/'
    this.origin = 'https://allemanfredi.github.io'
    this.iframe = null
    this._setupIframe()
  }

  _sendMessage (msg, cb) {
    msg.target = 'ledger-iframe'
    this.iframe.contentWindow.postMessage(msg, '*')
    window.addEventListener('message', ({ origin, data }) => {
      if (origin !== this.origin) return false
      if (data && data.action && data.action === `${msg.action}-reply`) {
        cb(data)
      }
    })
  }

  _setupIframe () {
    this.iframe = document.createElement('iframe')
    this.iframe.src = this.bridgeUrl
    document.head.appendChild(this.iframe)
  }
}

export default LedgerController