import { composeAPI } from '@iota/core'

class CustomizatorController {
  constructor (provider) {

    if (provider)
      this.iota = composeAPI({ provider })
  }

  setProvider (provider) {
    this.iota = composeAPI({ provider })
  }

  setWalletController (walletController) {
    this.walletController = walletController
  }

  async request (method, { uuid, resolve, data }) {
    switch (method) {
      case 'getCurrentAccount': {
        const account = this.walletController.getCurrentAccount()
        resolve({ data: account.data.latestAddress, success: true, uuid })
        break
      }
      case 'getCurrentNode': {
        const network = this.walletController.getCurrentNetwork()
        resolve({ data: network.provider, success: true, uuid })
        break
      }
      default: {
        if (data) {
          this.iota[method](...data.args)
          .then(res => resolve({ data: res, success: true, uuid }))
          .catch(err => resolve({ data: err.message, success: false, uuid }))
        } else {
          this.iota[method]()
          .then(res => resolve({ data: res, success: true, uuid }))
          .catch(err => resolve({ data: err.message, success: false, uuid }))
        }
      }
    }
  }
}

export default CustomizatorController
