import IOTA from '@pegasus/utils/iota'

const AccountDataController = {

  async retrieveAccountData (seed, network, currentAccount) {
    IOTA.setProvider(network.provider)
    const data = await IOTA.getAccountData(seed)
    const transactions = this.mapTransactions(data, network)
    const newData = this.mapBalance(data, network, currentAccount)
    return { transactions, newData }
  },

  mapBalance(data, network, currentAccount) {
    data.balance = network.type === 'mainnet'
      ? {
          mainnet: data.balance,
          testnet: currentAccount.data.balance.testnet,
        }
      : {
          mainnet: currentAccount.data.balance.testnet,
          testnet: data.balance
        }
    return data
  },


  mapTransactions (data, network) {
    const transactions = []
    const doubleBundle = []
    data.transfers.forEach(transfer => {
      if (transfer.length === 0)
        return

      let value
      //if sent tx
      if (transfer[0].value >= 0) {
        value = transfer[0].value
        if (!data.addresses.includes(transfer[0].address)){
          value = -value
        }
      } else {
        value = (-transfer[0].value - transfer[3].value)
      }
      
      const obj = {
        timestamp: transfer[0].attachmentTimestamp,
        value,
        status: transfer[0].persistence,
        bundle: transfer[0].bundle,
        index: transfer[0].currentIndex,
        transfer,
        network
      }

      // remove double bundle
      const app = doubleBundle.filter(bundle => bundle === obj.bundle)
      if (app.length === 0) {
        transactions.push(obj)
        doubleBundle.push(obj.bundle)
      }
    })
    return transactions
  },

  updateAccountTransactionsPersistence(account, transactions) {
    for (let tx of transactions) {
      for (let tx2 of account.transactions) {
        if (
          tx.bundle === tx2.bundle &&
          tx.status !== tx2.status
        ) {
          tx2.status = tx.status
        }
      }
    }
    return account
  },

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
  },

  getNewTransactionsFromAll (account, transactions) {
    const newTxs = []
    for (let txToCheck of transactions) {
      let isNew = true
      for (let tx of account.transactions ) {
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
}

export default AccountDataController

// bundle explanation : //https://domschiener.gitbooks.io/iota-guide/content/chapter1/bundles.html
