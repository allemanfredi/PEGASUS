import { backgroundMessanger } from '@pegasus/utils/messangers'
import { APP_STATE } from '@pegasus/utils/states'
import { composeAPI } from '@iota/core'
import { extractJson } from '@iota/extract-json'
import logger from '@pegasus/utils/logger'

const ACCOUNT_RELOAD_TIME = 100000

class AccountDataController {
  constructor(options) {
    const {
      networkController,
      walletController,
      notificationsController,
      stateStorageController
    } = options

    this.networkController = networkController
    this.walletController = walletController
    this.notificationsController = notificationsController
    this.stateStorageController = stateStorageController

    this.accountDataHandler = null
    this.transactionsAutoPromotionHandler = null
  }

  stopHandle() {
    clearInterval(this.accountDataHandler)
  }

  startHandle() {
    const account = this.walletController.getCurrentAccount()

    if (account) backgroundMessanger.setAccount(account)

    if (this.accountDataHandler) {
      return
    }

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
    const state = this.walletController.getState()
    if (state < APP_STATE.WALLET_UNLOCKED) {
      return
    }

    const seed = this.walletController.getCurrentSeed()
    const network = this.networkController.getCurrentNetwork()
    let account = this.walletController.getCurrentAccount()
    const { transactions, newData } = await this.retrieveAccountData(
      seed,
      network,
      account
    )

    //show notification
    const transactionsJustConfirmed = this.getTransactionsJustConfirmed(
      account,
      transactions
    )
    transactionsJustConfirmed.forEach(transaction => {
      this.notificationsController.showNotification(
        'Transaction Confirmed',
        transaction.bundle,
        network.link + 'bundle/' + transaction.bundle
      )
    })

    account = this.updateAccountTransactionsPersistence(account, transactions)
    const newTransactions = this.getNewTransactionsFromAll(
      account,
      transactions
    )

    const totalTransactions = [...newTransactions, ...account.transactions]

    const transactionsWithReattachSet = this.setTransactionsReattach(
      totalTransactions
    )

    const updatedData = Object.assign({}, newData, {
      transactions: transactionsWithReattachSet
    })

    this.walletController.updateTransactionsAccount(transactionsWithReattachSet)

    const updatedAccount = this.walletController.updateDataAccount(
      updatedData,
      network
    )
    backgroundMessanger.setAccount(updatedAccount)
  }

  async retrieveAccountData(_seed, _network, _currentAccount) {
    const iota = composeAPI({ provider: _network.provider })
    const data = await iota.getAccountData(_seed, { start: 0, security: 2 })
    const transactions = await this.mapTransactions(data, _network)
    const newData = this.mapBalance(data, _network, _currentAccount)
    return { transactions, newData }
  }

  mapBalance(_data, _network, _currentAccount) {
    _data.balance =
      _network.type === 'mainnet'
        ? {
            mainnet: _data.balance,
            testnet: _currentAccount.data.balance.testnet
          }
        : {
            mainnet: _currentAccount.data.balance.mainnet,
            testnet: _data.balance
          }
    return _data
  }

  async mapTransactions(_data, _network) {
    let transactions = []
    for (let transfer of _data.transfers) {
      if (transfer.length === 0) return

      let value = 0
      let values = []

      for (let t of transfer) {
        if (_data.addresses.includes(t.address)) {
          value = value + t.value
          values.push(t.value)
        }
      }

      if (value < 0) {
        value = 0
        values = values.map(value => -value)
        values.forEach(v => (value = value + v))
        value = -1 * value
      }

      const message = this.getMessage(transfer)

      const transaction = {
        timestamp: transfer[0].attachmentTimestamp,
        value,
        status: transfer[0].persistence,
        bundle: transfer[0].bundle,
        transfer,
        network: _network,
        message
      }

      transactions.push(transaction)
      transactions = this.removeInvalidTransactions(transactions)
    }
    return transactions
  }

  removeInvalidTransactions(_transactions) {
    const validated = _transactions.filter(transaction => transaction.status)
    const notValidated = _transactions.filter(
      transaction => !transaction.status
    )

    let notValidatedCorrect = []
    let isInvalid = false

    for (let txnv of notValidated) {
      isInvalid = false

      for (let txv of validated) {
        if (txv.bundle === txnv.bundle) {
          isInvalid = true
          break
        }
      }

      if (!isInvalid) {
        notValidatedCorrect.push(txnv)
      }
    }

    return [...validated, ...notValidatedCorrect]
  }

  updateAccountTransactionsPersistence(_account, _transactions) {
    for (let tx of _transactions) {
      for (let tx2 of _account.transactions) {
        if (tx.bundle === tx2.bundle && tx.status !== tx2.status) {
          tx2.status = tx.status
        }
      }
    }
    return _account
  }

  getTransactionsJustConfirmed(_account, _transactions) {
    const transactionsJustConfirmed = []
    for (let tx of _transactions) {
      for (let tx2 of _account.transactions) {
        if (
          tx.bundle === tx2.bundle &&
          tx.status !== tx2.status &&
          tx.status === true
        ) {
          transactionsJustConfirmed.push(tx)
        }
      }
    }
    return transactionsJustConfirmed
  }

  getNewTransactionsFromAll(_account, _transactions) {
    const newTxs = []
    for (let txToCheck of _transactions) {
      let isNew = true
      for (let tx of _account.transactions) {
        if (tx.bundle === txToCheck.bundle) {
          isNew = false
        }
      }
      if (isNew) {
        newTxs.push(txToCheck)
      }
    }
    return newTxs
  }

  setTransactionsReattach(_transactions) {
    const doubleBoundles = []
    for (let transaction of _transactions) {
      if (doubleBoundles.includes(transaction.bundle)) {
        transaction.isReattached = true
      } else {
        doubleBoundles.push(transaction.bundle)
      }
    }
    return _transactions
  }

  async promoteTransactions() {
    const network = this.networkController.getCurrentNetwork()
    const account = this.walletController.getCurrentAccount()

    const iota = composeAPI({ provider: network.provider })

    const tails = account.transactions
      .filter(transaction => transaction.network.type === network.type)
      .map(transaction => transaction.transfer[0].hash)

    const states = await iota.getLatestInclusion(tails)

    for (let [index, tail] of tails.entries()) {
      if (!states[index] && (await iota.isPromotable(tail))) {
        await iota.promoteTransaction(tail, 3, 14)
        logger.log(`(AccountDataController) Transaction promoted ${tail}`)
      } else {
        logger.log(`(AccountDataController) Transaction not promotable ${tail}`)
      }
    }
  }

  enableTransactionsAutoPromotion(_time) {
    this.transactionsAutoPromotionHandler = setInterval(
      () => {
        if (this.stateStorageController.isReady())
          this.promoteTransactions()
      },
      _time > 3 ? _time : 3
    )
    logger.log(`(AccountDataController) Enabled transactions auto promotion every ${_time} ms`)
  }

  disableTransactionsAutoPromotion() {
    clearInterval(this.transactionsAutoPromotionHandler)
    logger.log(`(AccountDataController) Disabled transactions auto promotion`)
  }

  getMessage(_bundle) {
    try {
      return JSON.parse(extractJson(_bundle))
    } catch (err) {
      return null
    }
  }
}

export default AccountDataController

// bundle explanation : //https://domschiener.gitbooks.io/iota-guide/content/chapter1/bundles.html
