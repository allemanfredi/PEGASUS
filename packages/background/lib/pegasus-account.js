// part of this code is taken from here https://github.com/iotaledger/iota.js/blob/next/packages/account/src/account.ts#L397
import EventEmitter3 from 'eventemitter3'
import { composeAPI } from '@iota/core'
import { bundleToTransaction, findUsedAddresses } from './account-data'

/**
 * Class used to rapresent an account within Pegasus
 */
class PegasusAccount extends EventEmitter3 {
  constructor(_configs) {
    super()

    const {
      seed,
      provider
    } = _configs

    this.seed = seed
    this.index = 1
    this.interval = null
    this.addresses = []
    this.transactions = []

    this.emittedIncludedDeposits = {}
    this.emittedPendingDeposits = {}
    this.emittedIncludedWithdrawals = {}
    this.emittedPendingWithdrawals = {}

    //RXVZXEFEHCFOLUDZLRTABWVPYGHJXSDICUPNXAAGMJMMLOEQPZIFRXWLRNJ9CSFBMQZCPSMJGGCKBZAMCBIOEEXXLB
    this.api = composeAPI({ provider: 'https://nodes.comnet.thetangle.org:443' })
  }

  /**
   * 
   * Returns an object containing data of this account
   */
  getData() {
    return {
      index: this.index,
      addresses: this.addresses,
      latestAddress: this.addresses[this.addresses.length - 1],
      transactions: this.transactions,
      emittedIncludedDeposits: this.emittedIncludedDeposits,
      emittedPendingDeposits: this.emittedPendingDeposits,
      emittedIncludedWithdrawals: this.emittedIncludedWithdrawals,
      emittedPendingWithdrawals: this.emittedPendingWithdrawals
    }
  }

  /**
   * 
   * Start fetching and storing data
   */
  startFetch() {
    if (this.interval) return

    this.interval = setInterval(() => {
      this.fetch()
    }, 1000)
  }

  /**
   *
   * Fetch account data and emits event related to
   * new deposits/withdrawals
   */
  async fetch() {

    if (this.addresses.length === 0) {
      await this.generateNewAddress(true)
    }

    const bundles = await this.api.getBundlesFromAddresses(this.addresses, true)
    bundles.
      filter(
        _bundle =>
          (this.emittedIncludedDeposits[_bundle[0].hash] !== true &&
            _bundle[0].persistence === true) ||
          (this.emittedPendingDeposits[_bundle[0].hash] !== true &&
            _bundle[0].persistence === false)
      )
      .filter(
        _bundle =>
          _bundle.findIndex(_tx => this.addresses.indexOf(_tx.address) > -1 && _tx.value > 0) > -1
      )
      .forEach(_bundle =>
        _bundle
          .filter(_tx => this.addresses.indexOf(_tx.address) > -1 && _tx.value > 0)
          .forEach(_tx => {

            this.transactions.push(bundleToTransaction(_bundle, this.addresses))

            // NOTE: update address when a deposit is detected and confirmed
            if (_bundle[0].persistence)
              this.generateNewAddress()

            this.emit(
              _bundle[0].persistence ? 'includedDeposit' : 'pendingDeposit',
              _bundle[0].bundle
            )

            this.emittedIncludedDeposits[_bundle[0].hash] = _bundle[0].persistence
              ? true
              : false // from iota.js is true i don't know why
            
            this.emit('data', this.getData())
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
          _bundle.findIndex(_tx => this.addresses.indexOf(_tx.address) > -1 && _tx.value < 0) > -1
      )
      .forEach(_bundle =>
        _bundle
          .filter(_tx => this.addresses.indexOf(_tx.address) > -1 && _tx.value < 0)
          .forEach(_tx => {

            this.transactions.push(bundleToTransaction(_bundle, this.addresses))

            // NOTE: update address when a withdrawal is detected and confirmed
            if (_bundle[0].persistence)
              this.generateNewAddress()

            this.emit(
              _bundle[0].persistence ? 'includedWithdrawal' : 'pendingWithdrawal',
              _bundle[0].bundle
            )

            this.emittedIncludedWithdrawals[_bundle[0].hash] = _bundle[0].persistence
              ? true
              : false // from iota.js is true i don't know why

            this.emit('data', this.getData())
          })
      )
    
    return this.getData()
  }

  /**
   * 
   * @param {Object} _data 
   */
  setData(_seed, _data) {
    this.seed = _seed
    //Object.keys(_data).map(_key => this[_key] = _data[_key])
    //console.log(this)
  }

  /**
   * 
   * Destroy all handlers
   */
  destroy() {
    clearInterval(this.interval)
    console.log("pegasusAccount destroy")
  }

  /**
   * 
   * @param {Object} _provider 
   */
  setProvider(_provider) {
    this.api = composeAPI({ provider: _provider })
    console.log("pegasusAccount setprovider")
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
      const addresses = await this.api.getNewAddress(this.seed, { index: this.index, returnAll: true })
      this.index = addresses.length
      this.addresses.push(...addresses)
      return
    }

    const address = await this.api.getNewAddress(this.seed, { index: this.index })
    if (!this.addresses.includes(address)) {
      this.index += 1
      this.addresses.push(address)
    }
    return address
  }

}

export default PegasusAccount