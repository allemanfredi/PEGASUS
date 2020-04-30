import { APP_STATE } from '@pegasus/utils/states'
import logger from '@pegasus/utils/logger'
import {
  mapBalance,
  mapTransactions,
  getNewPendingIncomingTransactions,
  getNewConfirmedTransactions,
  setTransactionsReattach
} from '../lib/account-data'
import Utils from '@pegasus/utils/utils'

const ACCOUNT_RELOAD_TIME = 90000

class AccountDataController {
  constructor(options) {
    const {
      networkController,
      walletController,
      nodeController,
      showNotification
    } = options

    this.networkController = networkController
    this.walletController = walletController
    this.showNotification = showNotification
    this.nodeController = nodeController

    this.accountDataHandler = null
  }

  stopHandle() {
    clearInterval(this.accountDataHandler)

    logger.log('(AccountDataController) Stop auto reloading account data')
  }

  startHandle() {
    if (this.accountDataHandler) return

    logger.log('(AccountDataController) Start auto reloading account data')

    this.accountDataHandler = setInterval(() => {
      const state = this.walletController.getState()
      if (state < APP_STATE.WALLET_UNLOCKED) {
        clearInterval(this.accountDataHandler)
        return
      }

      this.loadAccountData()
    }, ACCOUNT_RELOAD_TIME)
  }

  async loadAccountData() {
    try {
      const state = this.walletController.getState()
      if (state < APP_STATE.WALLET_UNLOCKED) return

      logger.log('(AccountDataController) Loading account data...')

      const account = this.walletController.getCurrentAccount()
      const previousTransactions = account.data.transactions

      const seed = account.seed
      const data = await this.retrieveAccountData(seed, account)

      const network = this.networkController.getCurrentNetwork()

      // get ONLY incoming pending transactions
      const pendingTransactions = getNewPendingIncomingTransactions(
        previousTransactions,
        data.transactions
      )
      pendingTransactions.forEach(_transaction => {
        this.showNotification(
          'New Pending Transaction',
          Utils.showAddress(_transaction.bundle, 15, 12),
          network.link + 'bundle/' + _transaction.bundle
        )
      })

      // get incoming and outcoming transactions just confirmed
      const confirmedTransactions = getNewConfirmedTransactions(
        previousTransactions,
        data.transactions
      )

      confirmedTransactions.forEach(_transaction => {
        this.showNotification(
          'Transaction Confirmed',
          Utils.showAddress(_transaction.bundle, 15, 12),
          network.link + 'bundle/' + _transaction.bundle
        )
      })

      const updatedData = Object.assign({}, data, {
        transactions: setTransactionsReattach(data.transactions)
      })

      this.walletController.updateDataAccount(updatedData)

      logger.log('(AccountDataController) Loading account data terminated')
    } catch (err) {
      logger.error(
        `(AccountDataController) Error during loading account data: ${err}`
      )
    }
    return true
  }

  async retrieveAccountData(_seed, _currentAccount) {
    const network = this.networkController.getCurrentNetwork()
    let data = await this.nodeController.getAccountData(_seed)
    const transactions = mapTransactions(data, network)
    data = mapBalance(data, network, _currentAccount)

    delete data.transfers
    delete data.inputs
    delete data.addresses

    if (_currentAccount) {
      const mixedTransactions = [
        ...transactions,
        ..._currentAccount.data.transactions
      ]
      data.transactions = mixedTransactions.filter((transaction, index) => {
        return (
          index ===
          mixedTransactions.findIndex(obj => {
            return (
              obj.bundle === transaction.bundle &&
              obj.timestamp === transaction.timestamp
            )
          })
        )
      })
    } else {
      data.transactions = transactions
    }

    return data
  }
}

export default AccountDataController

// bundle explanation : //https://domschiener.gitbooks.io/iota-guide/content/chapter1/bundles.html
