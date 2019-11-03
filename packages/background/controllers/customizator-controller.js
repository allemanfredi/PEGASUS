import { composeAPI } from '@iota/core'

class CustomizatorController {
  constructor (provider) {
    this.iota = composeAPI({ provider })
  }

  setProvider (provider) {
    this.iota = composeAPI({ provider })
  }

  async request (method, { uuid, resolve, seed, data }) {
    try {
      switch (method) {
        case 'addNeighbors': {
          this.iota.addNeighbors(...data.args)
            .then(numAdded => resolve({ data: numAdded, success: true, uuid }))
            .catch(err => resolve({ data: err.message, success: false, uuid }))
          break
        }
        case 'attachToTangle': {
          this.iota.attachToTangle(...data.args)
            .then(trytes => resolve({ data: trytes, success: true, uuid }))
            .catch(err => resolve({ data: err.message, success: false, uuid }))
          break
        }
        case 'broadcastBundle': {
          this.iota.broadcastBundle(...data.args)
            .then(transactions => resolve({ data: transactions, success: true, uuid }))
            .catch(err => resolve({ data: err.message, success: false, uuid }))
          break
        }
        case 'broadcastTransactions': {
          this.iota.broadcastTransactions(...data.args)
            .then(trytes => resolve({ data: trytes, success: true, uuid }))
            .catch(err => resolve({ data: err.message, success: false, uuid }))
          break
        }
        case 'checkConsistency': {
          this.iota.checkConsistency(...data.args)
            .then(isConsistent => resolve({ data: isConsistent, success: true, uuid }))
            .catch(err => resolve({ data: err.message, success: false, uuid }))
          break
        }
        case 'findTransactionObjects': {
          this.iota.findTransactionObjects(...data.args)
            .then(transactions => resolve({ data: transactions, success: true, uuid }))
            .catch(err => resolve({ data: err.message, success: false, uuid }))
          break
        }
        case 'findTransactions': {
          this.iota.findTransactions(...data.args)
            .then(transactions => resolve({ data: transactions, success: true, uuid }))
            .catch(err => resolve({ data: err.message, success: false, uuid }))
          break
        }
        case 'getBalances': {
          this.iota.getBalances(...data.args)
            .then(({ balances }) => resolve({ data: balances, success: true, uuid }))
            .catch(err => resolve({ data: err.message, success: false, uuid }))
          break
        }
        case 'getBundle': {
          this.iota.getBundle(...data.args)
            .then(bundle => resolve({ data: bundle, success: true, uuid }))
            .catch(err => resolve({ data: err.message, success: false, uuid }))
          break
        }
        case 'getInclusionStates': {
          this.iota.getInclusionStates(...data.args)
            .then(states => resolve({ data: states, success: true, uuid }))
            .catch(err => resolve({ data: err.message, success: false, uuid }))
          break
        }
        case 'getLatestInclusion': {
          this.iota.getLatestInclusion(...data.args)
            .then(states => resolve({ data: states, success: true, uuid }))
            .catch(err => resolve({ data: err.message, success: false, uuid }))
          break
        }
        case 'getNeighbors': {
          this.iota.getNeighbors()
            .then(neighbors => resolve({ data: neighbors, success: true, uuid }))
            .catch(err => resolve({ data: err.message, success: false, uuid }))
          break
        }
        case 'getNodeInfo': {
          this.iota.getNodeInfo()
            .then(info => resolve({ data: info, success: true, uuid }))
            .catch(err => resolve({ data: err.message, success: false, uuid }))
          break
        }
        case 'getTips': {
          this.iota.getTips()
            .then(tips => resolve({ data: tips, success: true, uuid }))
            .catch(err => resolve({ data: err.message, success: false, uuid }))
          break
        }
        case 'getTransactionObjects': {
          this.iota.getTransactionObjects(...data.args)
            .then(transaction => resolve({ data: transaction, success: true, uuid }))
            .catch(err => resolve({ data: err.message, success: false, uuid }))
          break
        }
        case 'getTransactionsToApprove': {
          this.iota.getTransactionsToApprove(...data.args)
            .then(transactions => resolve({ data: transactions, success: true, uuid }))
            .catch(err => resolve({ data: err.message, success: false, uuid }))
          break
        }
        case 'getTrytes': {
          this.iota.getTrytes(...data.args)
            .then(trytes => resolve({ data: trytes, success: true, uuid }))
            .catch(err => resolve({ data: err.message, success: false, uuid }))
          break
        }
        case 'isPromotable': {
          this.iota.isPromotable(...data.args)
            .then(isPromotable => resolve({ data: isPromotable, success: true, uuid }))
            .catch(err => resolve({ data: err.message, success: false, uuid }))
          break
        }
        case 'promoteTransaction': {
          this.iota.isPromotable(...data.args)
            .then(transaction => resolve({ data: transaction, success: true, uuid }))
            .catch(err => resolve({ data: err.message, success: false, uuid }))
          break
        }
        case 'removeNeighbors': {
          this.iota.removeNeighbors(...data.args)
            .then(state => resolve({ data: state, success: true, uuid }))
            .catch(err => resolve({ data: err.message, success: false, uuid }))
          break
        }
        case 'replayBundle': {
          this.iota.replayBundle(...data.args)
            .then(([reattachedTail]) => resolve({ data: reattachedTail, success: true, uuid }))
            .catch(err => resolve({ data: err.message, success: false, uuid }))
          break
        }
        case 'sendTrytes': {
          this.iota.sendTrytes(...data.args)
            .then(trytes => resolve({ data: trytes, success: true, uuid }))
            .catch(err => resolve({ data: err.message, success: false, uuid }))
          break
        }
        case 'storeAndBroadcast': {
          this.iota.storeAndBroadcast(...data.args)
            .then(trytes => resolve({ data: trytes, success: true, uuid }))
            .catch(err => resolve({ data: err.message, success: false, uuid }))
          break
        }
        case 'storeTransactions': {
          this.iota.storeTransactions(...data.args)
            .then(trytes => resolve({ data: trytes, success: true, uuid }))
            .catch(err => resolve({ data: err.message, success: false, uuid }))
          break
        }
        case 'traverseBundle': {
          this.iota.traverseBundle(...data.args)
            .then(bundle => resolve({ data: bundle, success: true, uuid }))
            .catch(err => resolve({ data: err.message, success: false, uuid }))
          break
        }
      }
    } catch (err) {
      resolve({ data: err.message, success: false, uuid })
    }
  }
}

export default CustomizatorController
