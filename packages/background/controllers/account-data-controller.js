import { APP_STATE } from '@pegasus/utils/states'
import logger from '@pegasus/utils/logger'
import {
  mapBalance,
  mapTransactions,
  getTransactionsJustConfirmed,
  setTransactionsReattach
} from '../lib/account-data'

const ACCOUNT_RELOAD_TIME = 300000

class AccountDataController {
  constructor(options) {
    const {
      networkController,
      walletController,
      notificationsController,
      nodeController
    } = options

    this.networkController = networkController
    this.walletController = walletController
    this.notificationsController = notificationsController
    this.nodeController = nodeController

    this.accountDataHandler = null
  }

  stopHandle() {
    clearInterval(this.accountDataHandler)

    logger.log(`(AccountDataController) Stop auto reloading account data`)
  }

  startHandle() {
    if (this.accountDataHandler) {
      return
    }

    logger.log(`(AccountDataController) Start auto reloading account data`)

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
      if (state < APP_STATE.WALLET_UNLOCKED) {
        return
      }

      logger.log(`(AccountDataController) Loading account data...`)

      const account = this.walletController.getCurrentAccount()
      const seed = account.seed
      const data = await this.retrieveAccountData(seed, account)

      // NOTE: show notification
      const transactionsJustConfirmed = getTransactionsJustConfirmed(
        account,
        data.transactions
      )

      const network = this.networkController.getCurrentNetwork()
      transactionsJustConfirmed.forEach(transaction => {
        this.notificationsController.showNotification(
          'Transaction Confirmed',
          transaction.bundle,
          network.link + 'bundle/' + transaction.bundle
        )
      })

      const updatedData = Object.assign({}, data, {
        transactions: setTransactionsReattach(data.transactions)
      })

      this.walletController.updateDataAccount(updatedData)

      logger.log(`(AccountDataController) Loading account data terminated`)
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
