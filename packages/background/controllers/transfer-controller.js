import Utils from '@pegasus/utils/utils'
import { composeAPI } from '@iota/core'
import { asciiToTrytes } from '@iota/converter'
import logger from '@pegasus/utils/logger'

class TransferController {
  constructor(options) {
    const {
      connectorController,
      walletController,
      popupController,
      networkController,
      stateStorageController
    } = options

    this.connectorController = connectorController
    this.walletController = walletController
    this.popupController = popupController
    this.networkController = networkController
  }

  confirmTransfers(_transfers) {
    return new Promise(resolve => {
      const network = this.networkController.getCurrentNetwork()
      const iota = composeAPI({ provider: network.provider })

      const account = this.walletController.getCurrentAccount()
      const seed = account.seed

      const depth = 3
      const minWeightMagnitude = network.difficulty

      const transfersCopy = Utils.copyObject(_transfers)

      transfersCopy.forEach(t => {
        t.value = parseInt(t.value)
        t.tag = asciiToTrytes(JSON.stringify(t.tag))
        t.message = asciiToTrytes(JSON.stringify(t.message))
      })

      try {
        iota
          .prepareTransfers(seed, transfersCopy)
          .then(trytes => {
            return iota.sendTrytes(trytes, depth, minWeightMagnitude)
          })
          .then(bundle => {
            logger.log(
              `(TransferController) Transfer success : ${bundle[0].bundle}`
            )

            resolve({
              success: true,
              response: bundle
            })
          })
          .catch(error => {
            logger.error(
              `(TransferController) Account during account transfer : ${error.message}`
            )

            resolve({
              success: false,
              tryAgain: true,
              response: error.message
            })
          })
      } catch (error) {
        logger.error(
          `(TransferController) Account during account transfer : ${error.message}`
        )
        resolve({
          success: false,
          tryAgain: true,
          response: error.message
        })
      }
    })
  }
}

export default TransferController
