import IOTA from '@pegasus/utils/iota'
import { backgroundMessanger } from '@pegasus/utils/messangers'
import { APP_STATE } from '@pegasus/utils/states'

class AccountDataController {
  constructor(options) {
    const {
      networkController,
      walletController,
      notificationsController
    } = options

    this.networkController = networkController
    this.walletController = walletController
    this.notificationsController = notificationsController
  }

  async retrieveAccountData(seed, network, currentAccount) {
    IOTA.setProvider(network.provider)
    const data = await IOTA.getAccountData(seed)
    const transactions = this.mapTransactions(data, network)
    const newData = this.mapBalance(data, network, currentAccount)
    return { transactions, newData }
  }

  mapBalance(data, network, currentAccount) {
    data.balance =
      network.type === 'mainnet'
        ? {
            mainnet: data.balance,
            testnet: currentAccount.data.balance.testnet
          }
        : {
            mainnet: currentAccount.data.balance.mainnet,
            testnet: data.balance
          }
    return data
  }

  mapTransactions(data, network) {
    let transactions = []
    data.transfers.forEach(transfer => {
      if (transfer.length === 0) return

      let value = 0
      let values = []

      for (let t of transfer) {
        if (data.addresses.includes(t.address)) {
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

      const transaction = {
        timestamp: transfer[0].attachmentTimestamp,
        value,
        status: transfer[0].persistence,
        bundle: transfer[0].bundle,
        transfer,
        network
      }

      transactions.push(transaction)
      transactions = this.removeInvalidTransactions(transactions)
    })
    return transactions
  }

  removeInvalidTransactions(transactions) {
    const validated = transactions.filter(transaction => transaction.status)
    const notValidated = transactions.filter(transaction => !transaction.status)

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

  updateAccountTransactionsPersistence(account, transactions) {
    for (let tx of transactions) {
      for (let tx2 of account.transactions) {
        if (tx.bundle === tx2.bundle && tx.status !== tx2.status) {
          tx2.status = tx.status
        }
      }
    }
    return account
  }

  getTransactionsJustConfirmed(account, transactions) {
    const transactionsJustConfirmed = []
    for (let tx of transactions) {
      for (let tx2 of account.transactions) {
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

  getNewTransactionsFromAll(account, transactions) {
    const newTxs = []
    for (let txToCheck of transactions) {
      let isNew = true
      for (let tx of account.transactions) {
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

  setTransactionsReattach(transactions) {
    const doubleBoundles = []
    for (let transaction of transactions) {
      if (doubleBoundles.includes(transaction.bundle)) {
        transaction.isReattached = true
      } else {
        doubleBoundles.push(transaction.bundle)
      }
    }
    return transactions
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
}

export default AccountDataController

// bundle explanation : //https://domschiener.gitbooks.io/iota-guide/content/chapter1/bundles.html
