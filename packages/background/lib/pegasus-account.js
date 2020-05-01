// part of this code is taken from here https://github.com/iotaledger/iota.js/blob/next/packages/account/src/account.ts#L397
import EventEmitter3 from 'eventemitter3'
import { composeAPI } from '@iota/core'
import { bundleToWalletTransaction, findUsedAddresses } from './account-data'

/**
 * Class used to rapresent an account within Pegasus
 */
class PegasusAccount extends EventEmitter3 {
  constructor(_configs) {
    super()

    const { seed, provider } = _configs

    this.seed = seed
    this.index = 0
    this.interval = null
    this.addresses = []
    this.walletTransactions = []

    this.emittedIncludedDeposits = {}
    this.emittedPendingDeposits = {}
    this.emittedIncludedWithdrawals = {}
    this.emittedPendingWithdrawals = {}

    this.api = composeAPI({ provider })
  }

  /**
   *
   * Returns an object containing data of this account.
   * If there are not address, at least 1 must be generated
   */
  async getData() {
    if (this.addresses.length === 0) {
      await this.generateNewAddress(true)
      await this.fetch()
    }

    return {
      index: this.index,
      addresses: this.addresses,
      latestAddress: this.addresses[this.addresses.length - 1],
      balance: await this.getBalance(),
      transactions: this.walletTransactions,
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

    this.interval = setInterval(() => {
      this.fetch(true)
    }, 30000)
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
    if (this.addresses.length === 0) {
      await this.generateNewAddress(true)
    }

    const bundles = await this.api.getBundlesFromAddresses(this.addresses, true)
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
          .forEach(_tx => {
            this._processNewBundle(_bundle, _withEmit, true)
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
          .forEach(_tx => {
            this._processNewBundle(_bundle, _withEmit, false)
          })
      )

    return this.getData()
  }

  /**
   *
   * Function used to process a new deposit or withdrawal
   * and emit an event if _withEmit is set to true
   *
   * @param {Object} _bundle
   * @param {Boolean} _withEmit
   * @param {Boolean} _incoming
   */
  _processNewBundle(_bundle, _withEmit, _incoming) {
    // check if already exists, if yes and this persistence is true update it
    const existsAsPending = this.walletTransactions.find(
      _tx => _tx.bundle === _bundle[0].bundle && _tx.persistence === false
    )

    if (existsAsPending)
      this.walletTransactions = this.walletTransactions.filter(
        _transaction => _transaction.bundle !== _bundle[0].bundle
      )

    this.walletTransactions.push(
      bundleToWalletTransaction(_bundle, this.addresses)
    )

    // NOTE: update address when a withdrawal is detected and confirmed
    if (_bundle[0].persistence) this.generateNewAddress()

    if (_withEmit) {
      this.emit(
        _incoming === true
          ? _bundle[0].persistence
            ? 'includedDeposit'
            : 'pendingDeposit'
          : _bundle[0].persistence
          ? 'includedWithdrawal'
          : 'pendingWithdrawal',
        _bundle[0].bundle
      )

      this.emit('data', this.getData())
    }

    if (_incoming) {
      this.emittedIncludedDeposits[_bundle[0].hash] = _bundle[0].persistence
        ? true
        : false // from iota.js is true i don't know why
    } else {
      this.emittedIncludedWithdrawals[_bundle[0].hash] = _bundle[0].persistence
        ? true
        : false // from iota.js is true i don't know why
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
   * Set a new seed
   *
   * @param {String} _seed
   */
  setSeed(_seed) {
    this.seed = _seed
    this.index = 0
  }

  /**
   *
   * Destroy all handlers
   */
  stopFetch() {
    clearInterval(this.interval)
    console.log('pegasusAccount stopFetch')
  }

  /**
   *
   * @param {Object} _provider
   */
  setProvider(_provider) {
    this.api = composeAPI({ provider: _provider })
    console.log('pegasusAccount setprovider')
  }

  /**
   *
   * Generate new Address and store it within
   * the whole list. If _fromStart is equal to true,
   * all addresses will be fetched
   *
   * @param {Boolean} _fromStart
   */
  async generateNewAddress(_fromStart = false) {
    if (_fromStart) {
      const addresses = await this.api.getNewAddress(this.seed, {
        index: this.index,
        returnAll: true
      })
      this.index = addresses.length
      this.addresses = addresses
      return
    }

    const address = await this.api.getNewAddress(this.seed, {
      index: this.index
    })
    if (!this.addresses.includes(address)) {
      this.index += 1
      this.addresses.push(address)
    }
    return address
  }
}

export default PegasusAccount
