import Mam from '@iota/mam/lib/mam.web.min.js'
import { trytesToAscii } from '@iota/converter'

class MamController {
  constructor(options) {
    const { networkController } = options
    this.networkController = networkController
  }

  fetch(_options) {
    const network = this.networkController.getCurrentNetwork()

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
