class LedgerService {

  constructor() {
    this.bridgeUrl = 'https://localhost:3000/ledger-trampoline'
    this.iframe = null
    this._setupIframe()
    this._sendMessage({
      action: 'ledger-init'
    }, ({success, payload}) => {
      console.log("sss", success)
      console.log("ppp", payload)
    })
  }

  _sendMessage (msg, cb) {
    msg.target = 'ledger-iframe'
    this.iframe.contentWindow.postMessage(msg, '*')
    window.addEventListener('message', ({ origin, data }) => {
      if (origin !== this._getOrigin()) return false
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

  _getOrigin () {
    const tmp = this.bridgeUrl.split('/')
    tmp.splice(-1, 1)
    return tmp.join('/')
  }
}

export default LedgerService