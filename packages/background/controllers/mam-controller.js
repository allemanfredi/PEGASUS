import Mam from '@iota/mam/lib/mam.web.min.js'
import { trytesToAscii } from '@iota/converter'

class MamController {
  constructor(options) {
    const { walletController } = options
    this.walletController = walletController
  }

  fetch(_options) {
    const network = this.walletController.getCurrentNetwork()

    const { root, mode, _sidekey, cb } = _options

    try {
      Mam.init(network.provider)
      Mam.fetch(root, mode, _sidekey, event => {
        cb(JSON.parse(trytesToAscii(event)))
      })
    } catch (error) {
      console.log('MAM fetch error', error)
    }
  }
}

export default MamController
