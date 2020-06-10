// part of this code is taken from here https://github.com/iotaledger/iota.js/blob/next/packages/account/src/account.ts#L397
import EventEmitter3 from 'eventemitter3'
import { composeAPI } from '@iota/core'
import { bundleToWalletTransaction } from './account-data'

const RELOAD_TIME = 15000

/**
 * Class used to rapresent an account within Pegasus
 */
class PegasusAccount extends EventEmitter3 {
  constructor(_configs) {
    super()

    const { seed, provider, minWeightMagnitude } = _configs

    this.seed = seed
    this.minWeightMagnitude = minWeightMagnitude
    this.index = 0
    this.interval = null
    this.addresses = []
    this.transactions = []

    this.emittedIncludedDeposits = {}
    this.emittedPendingDeposits = {}
    this.emittedIncludedWithdrawals = {}
    this.emittedPendingWithdrawals = {}

    this.api = composeAPI({ provider })

    this.interval = null
    this.transactionsAutoPromotionHandler = null
    this.transactionsAutoReattachmentHandler = null
  }

  /**
   *
   * Returns an object containing data of this account.
   * If there are not address, at least 1 must be generated
   */
  async getData() {
    if (this.addresses.length === 0) {
      await this._generateNewAddress(true)
      await this.fetch()
    }

    return {
      index: this.index,
      addresses: this.addresses,
      latestAddress: this.addresses[this.addresses.length - 1],
      balance: await this.getBalance(),
      transactions: this.transactions,
      emittedIncludedDeposits: this.emittedIncludedDeposits,
      emittedPendingDeposits: this.emittedPendingDeposits,
      emittedIncludedWithdrawals: this.emittedIncludedWithdrawals,
      emittedPendingWithdrawals: this.emittedPendingWithdrawals
    }
  }

  /**
   *
   * Get account balance
   */
  async getBalance() {
    const { balances } = await this.api.getBalances(this.addresses, 100)
    return balances.reduce((acc, b) => (acc += b), 0)
  }

  /**
   *
   * Start fetching and storing data
   */
  startFetch() {
    if (this.interval) return

    this.fetch(true)
    this.interval = setInterval(() => {
      this.fetch(true).catch(() => {
        return
      })
    }, RELOAD_TIME)
  }

  /**
   *
   * Fetch account data and emits event related to
   * new deposits/withdrawals. If _withEmit is set to
   * true, events will be emitted otherwise not
   *
   * @param {Boolean} _withEmit
   *
   */
  async fetch(_withEmit = false) {
    try {
      if (this.addresses.length === 0) {
        await this._generateNewAddress(true)
      }

      const bundles = await this.api.getBundlesFromAddresses(
        this.addresses,
        true
      )

      bundles
        .filter(
          _bundle =>
            (this.emittedIncludedDeposits[_bundle[0].hash] !== true &&
              _bundle[0].persistence === true) ||
            (this.emittedPendingDeposits[_bundle[0].hash] !== true &&
              _bundle[0].persistence === false)
        )
        .filter(
          _bundle =>
            _bundle.findIndex(
              _tx => this.addresses.indexOf(_tx.address) > -1 && _tx.value > 0
            ) > -1
        )
        .forEach(_bundle =>
          _bundle
            .filter(
              _tx => this.addresses.indexOf(_tx.address) > -1 && _tx.value > 0
            )
            .forEach(async _tx => {
              await this._processNewBundle(
                _bundle,
                _withEmit,
                true,
                _bundle[0].persistence ? 'includedDeposit' : 'pendingDeposit'
              )
            })
        )
      bundles
        .filter(
          _bundle =>
            (this.emittedIncludedWithdrawals[_bundle[0].hash] !== true &&
              _bundle[0].persistence === true) ||
            (this.emittedPendingWithdrawals[_bundle[0].hash] !== true &&
              _bundle[0].persistence === false)
        )
        .filter(
          _bundle =>
            _bundle.findIndex(
              _tx => this.addresses.indexOf(_tx.address) > -1 && _tx.value < 0
            ) > -1
        )
        .forEach(_bundle =>
          _bundle
            .filter(
              _tx => this.addresses.indexOf(_tx.address) > -1 && _tx.value < 0
            )
            .forEach(async _tx => {
              await this._processNewBundle(
                _bundle,
                _withEmit,
                false,
                _bundle[0].persistence
                  ? 'includedWithdrawal'
                  : 'pendingWithdrawal'
              )
            })
        )

      return this.getData()
    } catch (err) {
      throw new Error(err.message)
    }
  }

  /**
   *
   * Function used to process a new deposit or withdrawal
   * and emit an event if _withEmit is set to true
   *
   * @param {Object} _bundle
   * @param {Boolean} _withEmit
   * @param {Boolean} _incoming
   * @param {String} _eventName
   */
  async _processNewBundle(_bundle, _withEmit, _incoming, _eventName) {
    const exists = this.transactions.find(
      _tx => _tx.bundle === _bundle[0].bundle
    )

    if (exists)
      this.transactions = this.transactions.filter(
        _transaction => _transaction.bundle !== _bundle[0].bundle
      )

    this.transactions.push(bundleToWalletTransaction(_bundle, this.addresses))

    // NOTE: update address when a withdrawal is detected and confirmed
    if (_bundle[0].persistence && !_incoming) await this._generateNewAddress()

    if (_incoming) {
      if (_bundle[0].persistence) {
        this.emittedIncludedDeposits[_bundle[0].hash] = true
      } else {
        this.emittedPendingDeposits[_bundle[0].hash] = true
      }
    } else {
      if (_bundle[0].persistence) {
        this.emittedIncludedWithdrawals[_bundle[0].hash] = true
      } else {
        this.emittedPendingWithdrawals[_bundle[0].hash] = true
      }
    }

    if (_withEmit) {
      this.emit(_eventName, _bundle[0].bundle)

      const data = await this.getData()
      this.emit('data', data)
    }
  }

  /**
   *
   * @param {Object} _data
   */
  setData(_seed, _data) {
    this.seed = _seed
    Object.keys(_data).map(_key => (this[_key] = _data[_key]))
  }

  /**
   *
   * Set a new seed and reset everything
   *
   * @param {String} _seed
   */
  setSeed(_seed) {
    this.seed = _seed
    this._reset()
  }

  /**
   *
   * Destroy all handlers
   */
  clear() {
    clearInterval(this.interval)
    clearInterval(this.transactionsAutoPromotionHandler)
    clearInterval(this.transactionsAutoReattachmentHandler)
    this.seed = null
    this._reset()
  }

  /**
   *
   * @param {Object} _provider
   */
  setProvider(_provider) {
    this.api = composeAPI({ provider: _provider })
  }

  /**
   *
   * Generate new Address and store it within
   * the whole list. If _fromStart is equal to true,
   * all addresses will be fetched
   *
   * @param {Boolean} _fromStart
   */
  async _generateNewAddress(_fromStart = false) {
    if (_fromStart) {
      const addresses = await this.api.getNewAddress(this.seed, {
        index: this.index,
        returnAll: true
      })
      this.index = addresses.length
      this.addresses = addresses
      return addresses
    }

    const address = await this.api.getNewAddress(this.seed, {
      index: this.index
    })
    if (!this.addresses.includes(address)) {
      this.addresses.push(address)
      this.index = this.addresses.length
    }
    return address
  }

  /**
   *
   * Reset all account data
   */
  _reset() {
    this.addresses = []
    this.transactions = []
    this.index = 0
    this.emittedIncludedDeposits = {}
    this.emittedPendingDeposits = {}
    this.emittedIncludedWithdrawals = {}
    this.emittedPendingWithdrawals = {}
  }

  /**
   * Promote transactions
   *
   * @param {Integer} _minWeightMagnitude
   */
  async _promoteTransactions(_minWeightMagnitude) {
    const tails = this.transactions
      .filter(_tx => !_tx.persistence)
      .map(_tx => _tx.hash)

    for (let tail of tails) {
      if (await this.api.isPromotable(tail)) {
        await this.api.promoteTransaction(tail, 3, this.minWeightMagnitude)
      }
    }
  }

  /**
   *
   * Enable transactions auto promotion
   * with an interval specified by _time.
   * _time must be greater than 15 minutes
   *
   * @param {Number} _time
   */
  enableTransactionsAutoPromotion(_time) {
    this._promoteTransactions()
    this.transactionsAutoPromotionHandler = setInterval(
      () => {
        this._promoteTransactions()
      },
      _time > 15 * 60 * 1000 ? _time : 15 * 60 * 1000
    )
  }

  /**
   * Disable transaction auto promotion
   */
  disableTransactionsAutoPromotion() {
    if (this.transactionsAutoPromotionHandler) {
      clearInterval(this.transactionsAutoPromotionHandler)
    }
  }

  /**
   * Reattach transactions
   *
   */
  async _reattachTransactions() {
    const tails = this.transactions
      .filter(_tx => !_tx.persistence)
      .map(_tx => _tx.hash)

    for (let tail of tails) {
      if (!(await this.api.isPromotable(tail))) {
        await this.api.replayBundle(tail, 3, this.minWeightMagnitude)
      }
    }
  }

  /**
   *
   * Enable transactions auto reattachment
   * with an interval specified by _time.
   * _time must be greater than 20 minutes
   *
   * @param {Number} _time
   */
  enableTransactionsAutoReattachment(_time) {
    this._reattachTransactions()
    this.transactionsAutoReattachmentHandler = setInterval(
      () => {
        this._reattachTransactions()
      },
      _time > 15 * 60 * 1000 ? _time : 15 * 60 * 1000
    )
  }

  /**
   * Disable transaction auto reattachment
   */
  disableTransactionsAutoReattachment() {
    if (this.transactionsAutoReattachmentHandler) {
      clearInterval(this.transactionsAutoReattachmentHandler)
    }
  }
}

export default PegasusAccount
