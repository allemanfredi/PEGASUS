import Mam from '@iota/mam/lib/mam.web.min.js'
import { trytesToAscii } from '@iota/converter'

const MamController = {

  fetch (provider, root, mode, sidekey, callback) {
    try {
      Mam.init(provider)
      console.log(Mam)
      Mam.fetch(root, mode, sidekey, event => {
        callback(JSON.parse(trytesToAscii(event)))
      })
    } catch (error) {
      console.log('MAM fetch error', error)
    }
  }
}

export default MamController
