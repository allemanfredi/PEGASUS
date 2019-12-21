import { composeAPI } from '@iota/core'
import { asciiToTrytes } from '@iota/converter'
import { extractJson } from '@iota/extract-json'

export default {

  init (provider) {
    this.iota = composeAPI({ provider })
  },

  setProvider (provider) {
    this.iota = composeAPI({ provider })
  },

  async getNodeInfo () {
    return new Promise((resolve, reject) => {
      this.iota.getNodeInfo()
        .then(info => resolve(info))
        .catch(err => {
          reject(err)
        })
    })
  },

  async getNewAddress (seed) {
    return new Promise((resolve, reject) => {
      this.iota.getNewAddress(seed)
        .then(address => resolve(address))
        .catch(err => {
          reject(err)
        })
    })
  },

  async getBalance (address) {
    return new Promise((resolve, reject) => {
      this.iota.getBalances([address], 100)
        .then(res => resolve(res.balances[0]))
        .catch(err => {
          reject(err)
        })
    })
  },

  async getAllTransactions (addresses) {
    return new Promise((resolve, reject) => {
      this.iota.findTransactionObjects({ addresses })
        .then(transactions => resolve(transactions))
        .catch(err => {
          reject(err)
        })
    })
  },

  async prepareTransfer (transfer, ret) {
    const transfers = [{
      address: transfer.to,
      value: parseInt(transfer.value),
      tag: asciiToTrytes(JSON.stringify(transfer.tag)), // optional tag of `0-27` trytes
      message: asciiToTrytes(JSON.stringify(transfer.message)) // optional message in trytes
    }]

    const depth = 3

    // Difficulty of Proof-of-Work required to attach transaction to tangle.
    // Minimum value on mainnet & spamnet is `14`, `9` on devnet and other testnets.
    const minWeightMagnitude = transfer.difficulty

    try {
      this.iota.prepareTransfers(transfer.seed, transfers)
        .then(trytes => {
          return this.iota.sendTrytes(trytes, depth, minWeightMagnitude)
        })
        .then(bundle => {
          ret(bundle[0].hash, null)
        })
        .catch(err => {
          ret(null, err)
        })
    } catch (err) {
      ret(null, err)
    }
  },

  async getLatestInclusion (hashes) {
    return new Promise(async (resolve, reject) => {
      this.iota.getLatestInclusion(hashes)
        .then(states => resolve(states))
        .catch(err => {
          // reject(err);
          console.log(err)
        })
    })
  },

  async getAccountData (seed) {
    return new Promise((resolve, reject) => {
      this.iota.getAccountData(seed, { start: 0, security: 2 })
        .then(accountData => {
          resolve(accountData)
        })
        .catch(err => {
          reject(err)
        })
    })
  },


  async getBundle (transaction) {
    return new Promise((resolve, reject) => {
      this.iota.getBundle(transaction)
        .then(bundle => {
          resolve(bundle)
        })
        .catch(err => {
          reject(err)
        })
    })
  },

  async isPromotable (tail) {
    return new Promise((resolve, reject) => {
      this.iota.isPromotable(tail, { rejectWithReason: true })
        .then(isPromotable => {
          resolve(isPromotable)
        }).catch(err => {
          reject(err)
        })
    })
  },

  async promoteTransaction (tail) {
    return new Promise((resolve, reject) => {
      this.iota.promoteTransaction(tail, 3, 14)
        .then(() => {
          resolve()
        })
        .catch(err => {
          reject(err)
        })
    })
  },

  async replayBundle (tail) {
    return new Promise((resolve, reject) => {
      this.iota.replayBundle(tail, 3, 14)
        .then(transactions => {
          resolve(transactions)
        })
        .catch(err => {
          reject(err)
        })
    })
  },

  async findTransactionObject (options) {
    return new Promise((resolve, reject) => {
      this.iota.findTransactionObjects(options)
        .then(transactions => {
          resolve(transactions)
        })
        .catch(err => {
          reject(err)
        })
    })
  },

  async getMessage (tail) {
    return new Promise(async (resolve, reject) => {
      const bundle = await getBundle(tail)
      try {
        const message = JSON.parse(extractJson(bundle))
        resolve(message)
      } catch (err) {
        reject(err)
      }
    })
  }
}
