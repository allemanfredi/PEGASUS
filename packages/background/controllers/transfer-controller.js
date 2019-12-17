import Duplex from '@pegasus/utils/duplex'
import { backgroundMessanger } from '@pegasus/utils/messangers'
import Utils from '@pegasus/utils/utils'
import { composeAPI } from '@iota/core'
import { asciiToTrytes } from '@iota/converter'

class TransferController {

  constructor (options) {

    const duplex = new Duplex.Host()
    backgroundMessanger.init(duplex)

    const {
      connectorController,
      walletController,
      popupController,
      networkController
    } = options

    this.connectorController = connectorController
    this.walletController = walletController
    this.popupController = popupController
    this.networkController = networkController
  }

  confirmTransfers (transfers) {
    return new Promise(resolve => {
      backgroundMessanger.setTransfersConfirmationLoading(true)
  
      const network = this.networkController.getCurrentNetwork()
      const iota = composeAPI({ provider: network.provider })
  
      const key = this.walletController.getKey()
      const account = this.walletController.getCurrentAccount()
      const seed = Utils.aes256decrypt(account.seed, key)
  
      const depth = 3
      const minWeightMagnitude = network.difficulty
  
      // convert message and tag from char to trits
      const transfersCopy = Utils.copyObject(transfers)

      transfersCopy.forEach(t => {
        t.value = parseInt(t.value)
        t.tag = asciiToTrytes(JSON.stringify(t.tag))
        t.message = asciiToTrytes(JSON.stringify(t.message))
      })
  
      try {
        iota.prepareTransfers(seed, transfersCopy)
          .then(trytes => {
            return iota.sendTrytes(trytes, depth, minWeightMagnitude)
          })
          .then(bundle => {
    
            backgroundMessanger.setTransfersConfirmationLoading(false)
            resolve({
              success: true,
              data: bundle
            })
          })
          .catch(error => {
            backgroundMessanger.setTransfersConfirmationError(error.message)
            backgroundMessanger.setTransfersConfirmationLoading(false)

            resolve({
              success: false,
              tryAgain: true,
              error: error.message
            })
          })
      } catch (error) {
        backgroundMessanger.setTransfersConfirmationError(error.message)
        backgroundMessanger.setTransfersConfirmationLoading(false)

        resolve({
          success: false,
          tryAgain: true,
          error: error.message
        })
      }
    })
  }
}

export default TransferController