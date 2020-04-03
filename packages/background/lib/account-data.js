import { extractJson } from '@iota/extract-json'

const getMessage = _bundle => {
  try {
    return JSON.parse(extractJson(_bundle))
  } catch (err) {
    return null
  }
}

const mapBalance = (_data, _network, _currentAccount) => {
  _data.balance = Object.assign(
    {},
    _network.type === 'mainnet'
      ? {
          mainnet: _data.balance,
          testnet: _currentAccount ? _currentAccount.data.balance.testnet : 0
        }
      : {
          mainnet: _currentAccount ? _currentAccount.data.balance.mainnet : 0,
          testnet: _data.balance
        }
  )
  return _data
}

const removeInvalidTransactions = _transactions => {
  const validated = _transactions.filter(transaction => transaction.status)
  const notValidated = _transactions.filter(transaction => !transaction.status)

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

    if (!isInvalid) notValidatedCorrect.push(txnv)
  }

  return [...validated, ...notValidatedCorrect]
}

const mapTransactions = (_data, _network) => {
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
      values.forEach(v => {
        value = value + v
      })
      value = -1 * value
    }

    const message = getMessage(transfer)

    const transaction = {
      timestamp: transfer[0].attachmentTimestamp,
      value,
      status: transfer[0].persistence,
      bundle: transfer[0].bundle,
      transfer,
      network: _network.type,
      message
    }

    transactions.push(transaction)
    transactions = removeInvalidTransactions(transactions)
  }
  return transactions
}

const getTransactionsJustConfirmed = (_account, _transactions) => {
  const transactionsJustConfirmed = []
  for (let tx of _transactions) {
    for (let tx2 of _account.data.transactions) {
      if (
        tx.bundle === tx2.bundle &&
        tx.status !== tx2.status &&
        tx.status === true
      )
        transactionsJustConfirmed.push(tx)
    }
  }
  return transactionsJustConfirmed
}

const setTransactionsReattach = _transactions => {
  const doubleBoundles = []
  for (let transaction of _transactions) {
    if (doubleBoundles.includes(transaction.bundle))
      transaction.isReattached = true
    else doubleBoundles.push(transaction.bundle)
  }
  return _transactions
}

export {
  mapBalance,
  mapTransactions,
  removeInvalidTransactions,
  getTransactionsJustConfirmed,
  setTransactionsReattach,
  getMessage
}
