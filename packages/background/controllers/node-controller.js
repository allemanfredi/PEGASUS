import Utils from '@pegasus/utils/utils'
import { composeAPI } from '@iota/core'
import { asciiToTrytes } from '@iota/converter'
import logger from '@pegasus/utils/logger'

class NodeController {
  constructor(options) {
    const {
      walletController,
      networkController,
      stateStorageController
    } = options

    this.walletController = walletController
    this.networkController = networkController
    this.stateStorageController = stateStorageController

    this.transactionsAutoPromotionHandler = null
    this.provider = null
  }

  // NOTE following fx handles request from popup
  execute(_method, _args) {
    switch(_method) {
      case 'transfer': {
        return this.transfer(..._args) 
      }
      case 'prepareTransfers': {
        return this.prepareTransfers(..._args)
      }
      default: {
        return this.getNodeApi()[_method](..._args)
      }
    }
  }

  getNodeApi(_provider) {
    const network = this.networkController.getCurrentNetwork()
    if (!this.provider || network.provider !== this.provider) {
      this.provider = network.provider
      this.api = composeAPI({ provider: network.provider })
    }

    return this.api
  }

  getAccountData(_seed) {
    return this.getNodeApi().getAccountData(_seed, { start: 0, security: 2 })
  }

  prepareTransfers(_transfers, _options = []) {
    const seed = this.walletController.getCurrentSeed()

    const transfersCopy = Utils.copyObject(_transfers)
    transfersCopy.forEach(t => {
      t.value = parseInt(t.value)
      t.tag = asciiToTrytes(JSON.stringify(t.tag))
      t.message = asciiToTrytes(JSON.stringify(t.message))
    })

    return this.getNodeApi().prepareTransfers(seed, transfersCopy, _options)
  }


  async transfer(_transfers, _options = []) {
    const network = this.networkController.getCurrentNetwork()
    const depth = 3
    const minWeightMagnitude = network.difficulty

    const trytes = await this.prepareTransfers(_transfers, _options)
    const bundle = await this.getNodeApi().sendTrytes(trytes, depth, minWeightMagnitude)

    logger.log(
      `(NodeController) Transfer success : ${bundle[0].bundle}`
    )

    return bundle
  }

  async promoteTransactions() {
    const network = this.networkController.getCurrentNetwork()
    const account = this.walletController.getCurrentAccount()

    const tails = account.transactions
      .filter(transaction => transaction.network === network.type)
      .map(transaction => transaction.transfer[0].hash)

    const states = await this.getNodeApi().getLatestInclusion(tails)

    for (let [index, tail] of tails.entries()) {
      if (!states[index] && (await this.getNodeApi().isPromotable(tail))) {
        await this.getNodeApi().promoteTransaction(tail, 3, 14)
        logger.log(`(NodeController) Transaction promoted ${tail}`)
      } else {
        logger.log(`(NodeController) Transaction not promotable ${tail}`)
      }
    }
  }

  enableTransactionsAutoPromotion(_time) {
    this.transactionsAutoPromotionHandler = setInterval(
      () => {
        if (this.stateStorageController.isReady()) this.promoteTransactions()
      },
      _time > 3 ? _time : 3
    )
    logger.log(
      `(NodeController) Enabled transactions auto promotion every ${_time} ms`
    )
  }

  disableTransactionsAutoPromotion() {
    clearInterval(this.transactionsAutoPromotionHandler)
    logger.log(`(NodeController) Disabled transactions auto promotion`)
  }
}

export default NodeController
