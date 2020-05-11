import { composeAPI } from '@iota/core'
import { asciiToTrytes } from '@iota/converter'
import logger from '@pegasus/utils/logger'
import { APP_STATE } from '@pegasus/utils/states'

class NodeController {
  constructor(options) {
    const { walletController, stateStorageController } = options

    this.walletController = walletController
    this.stateStorageController = stateStorageController

    this.transactionsAutoPromotionHandler = null
    this.provider = null

    /*
     * NOTE:
     *  kept it here and stored into global state only when the wallet is unlocked,
     *  in order to don't increase the storage size, because in order to
     *  don't miss these values, they should be stored
     *  since the state is reset and written into the storage when the
     *  wallet is locked
     */

    this.recents = {}
  }

  /**
   *
   * execute a request sent from the popup/tabs
   * which must be already passed through the connector
   *
   * @param {String} _method
   * @param {Array} _args
   */
  execute(_method, _args) {
    switch (_method) {
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

  /**
   *
   * Returns an instance of iota.js composeAPI
   * result given a provider
   *
   * @param {String} _provider
   */
  getNodeApi(_provider) {
    const network = this.walletController.getCurrentNetwork()
    if (!this.provider || network.provider !== this.provider) {
      this.provider = network.provider
      this.api = composeAPI({ provider: network.provider })
    }

    return this.api
  }

  /**
   *
   * Generate and sing the trytes bundle
   *
   * @param {Array} _transfers
   * @param {Array} _options
   */
  prepareTransfers(_transfers, _options = []) {
    const seed = this.walletController.getCurrentSeed()

    logger.log('(NodeController) signing ...')

    // NOTE: store address in recents array
    const network = this.walletController.getCurrentNetwork()
    if (!this.recents[network.type]) this.recents[network.type] = []

    const newAddresses = []
    _transfers.forEach(_transfer => {
      if (!this.recents[network.type].includes(_transfer.address))
        newAddresses.push(_transfer.address)
    })

    this.recents[network.type].push(...newAddresses)
    this.stateStorageController.set('recents', this.recents)

    return this.getNodeApi().prepareTransfers(seed, _transfers, _options)
  }

  /**
   *
   * Wrapper of prepareTransfer + sendTrytes
   *
   * @param {Array} _transfers
   * @param {Array} _options
   */
  async transfer(_transfers, _options = []) {
    const network = this.walletController.getCurrentNetwork()
    const depth = 3
    const minWeightMagnitude = network.difficulty

    const trytes = await this.prepareTransfers(_transfers, _options)
    const bundle = await this.getNodeApi().sendTrytes(
      trytes,
      depth,
      minWeightMagnitude
    )

    logger.log(`(NodeController) Transfer success : ${bundle[0].bundle}`)

    return bundle
  }

  /**
   * Promote current account transaction
   */
  async promoteTransactions() {
    const network = this.walletController.getCurrentNetwork()
    const account = this.walletController.getCurrentAccount()

    const tails = account[network.type].data.transactions
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

  /**
   *
   * Enable transactions auto promotion
   * with an interval specified by _time
   *
   * @param {Number} _time
   */
  enableTransactionsAutoPromotion(_time) {
    this.transactionsAutoPromotionHandler = setInterval(
      () => {
        const state = this.walletController.getState()
        if (state > APP_STATE.WALLET_LOCKED) this.promoteTransactions()
      },
      _time > 3 ? _time : 3
    )
    logger.log(
      `(NodeController) Enabled transactions auto promotion every ${_time} ms`
    )
  }

  /**
   * Disable transaction auto promotion
   */
  disableTransactionsAutoPromotion() {
    if (this.transactionsAutoPromotionHandler) {
      clearInterval(this.transactionsAutoPromotionHandler)
      logger.log('(NodeController) Disabled transactions auto promotion')
    }
  }

  /**
   *
   * TODO: remove when the UI will be refactored
   * since this.recents is also within the global state
   * and will be handled with redux during the popup
   * opening
   *
   */
  getRecentsAddresses() {
    return this.recents
  }
}

export default NodeController
