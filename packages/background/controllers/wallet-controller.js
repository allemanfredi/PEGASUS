import { APP_STATE, STATE_NAME } from '@pegasus/utils/states'
import Utils from '@pegasus/utils/utils'
import logger from '@pegasus/utils/logger'
import options from '@pegasus/utils/options'
import { EventEmitter } from 'eventemitter3'
import PegasusAccount from '../lib/pegasus-account'
import argon2 from 'argon2-browser'
import crypto from 'crypto'
import { NETWORK_TYPES, SESSION_TIME_CHECK } from '../lib/constants'
import { removeSeed } from '../lib/removers'

class WalletController extends EventEmitter {
  constructor(options) {
    super()

    const {
      stateStorageController,
      showNotification,
      getInternalConnections
    } = options

    this.stateStorageController = stateStorageController
    this.showNotification = showNotification
    this.getInternalConnections = getInternalConnections

    this.session = null
    this.sessionInterval = null

    this.password = null

    this.selectedAccount = new PegasusAccount({
      provider: this.getCurrentNetwork().provider
    })

    /**
     * NOTE:
     *  in case of provider changing, a new selected account must be created.
     *  It's important to _removeAccountListeners before each account initialization
     *  in order to remove the previouse listeners and avoiding data overwritting
     */

    this.on('providerChanged', _provider => {
      if (this.getState() > APP_STATE.WALLET_LOCKED) {
        const account = this.getCurrentAccount()
        const network = this.getCurrentNetwork()

        this._removeAccountListeners()
        this.selectedAccount.clear()
        this.selectedAccount = new PegasusAccount({
          provider: network.provider
        })
        this._bindAccountListeners()
        this.selectedAccount.setData(account.seed, account.data[network.type])
        this.selectedAccount.startFetch()
      }
    })
  }

  /*setRequestsController(_requestController) {
    this.requestsController = _requestController
  }*/

  /**
   *
   * Remove listeners
   */
  _removeAccountListeners() {
    logger.log('(WalletController) Removing account listeners...')
    this.selectedAccount.removeAllListeners()
  }

  /**
   *
   * Add listeners for the current selected account
   */
  _bindAccountListeners() {
    logger.log('(WalletController) Binding account listeners...')

    // NOTE: binding selected account listener
    this.selectedAccount.on('data', _data => this.updateDataAccount(_data))

    this.selectedAccount.on('pendingDeposit', _bundle =>
      this._handleAccountEvent('New Pending Deposit', _bundle)
    )
    this.selectedAccount.on('includedDeposit', _bundle =>
      this._handleAccountEvent('Deposit has been included', _bundle)
    )
    this.selectedAccount.on('pendingWithdrawal', _bundle =>
      this._handleAccountEvent('New Pending Withdrawal', _bundle)
    )
    this.selectedAccount.on('includedWithdrawal', _bundle =>
      this._handleAccountEvent('Withdrawal has been included', _bundle)
    )
  }

  /**
   *
   * Show notification each deposit/withdrawal
   *
   * @param {String} _msg
   * @param {String} _bundle
   */
  _handleAccountEvent(_msg, _bundle) {
    const network = this.getCurrentNetwork()
    this.showNotification(
      _msg,
      Utils.showAddress(_bundle, 15, 12),
      network.link + 'bundle/' + _bundle
    )
  }

  /**
   *
   * Function used to check if pegasus
   * has been initialized
   */
  isWalletSetup() {
    const state = this.getState()
    if (state >= APP_STATE.WALLET_INITIALIZED) return true

    return false
  }

  /**
   *
   * Init the wallet given a password and the
   * first account
   *
   * @param {String} _password
   * @param {Object} _account
   */
  async initWallet(_password, _account) {
    try {
      this.stateStorageController.init(_password)

      await this.storePassword(_password)

      await this.stateStorageController.unlock(_password)

      const isCreated = await this.addAccount(_account, true)
      if (!isCreated) return false

      this.setState(APP_STATE.WALLET_INITIALIZED)

      // in order to write on storage the first time
      await this.stateStorageController.lock()
      await this.stateStorageController.unlock(_password)

      this.startSession()

      this.setState(APP_STATE.WALLET_UNLOCKED)

      logger.log('(WalletController) Wallet initialized')
      return true
    } catch (err) {
      logger.error(
        `(WalletController) Error during wallet initialization ${err.message}`
      )
      return false
    }
  }

  /**
   *
   * Unlock the wallet by providing a password
   *
   * @param {String} _password
   */
  async unlockWallet(_password) {
    if (await this.comparePassword(_password)) {
      this.startSession()

      this.password = _password

      await this.stateStorageController.unlock(_password)

      this.setState(APP_STATE.WALLET_UNLOCKED)

      const account = this.getCurrentAccount()
      const network = this.getCurrentNetwork()

      this.selectedAccount = new PegasusAccount({ provider: network.provider })
      this._bindAccountListeners()
      this.selectedAccount.setData(account.seed, account.data[network.type])
      this.selectedAccount.startFetch()

      this.emit('accountChanged', account.data[network.type].latestAddress)

      logger.log(
        `(WalletController) Wallet unlocked with account: ${account.name}`
      )
      return true
    }

    return false
  }

  /**
   *
   * Lock the wallet
   */
  async lockWallet() {
    this.password = null
    this.setState(APP_STATE.WALLET_LOCKED)
    await this.stateStorageController.lock()

    this.deleteSession()

    this.selectedAccount.clear()
    this._removeAccountListeners()

    logger.log('(WalletController) Wallet succesfully locked')
    return true
  }

  /**
   *
   * Restore the wallet given a password which
   * will be compared with the one stored within pegasus.
   * If match, a new account will be created and the previous
   * data will be deleted
   *
   * @param {String} _password
   * @param {Object} _account
   */
  async restoreWallet(_password, _account) {
    if (!(await this.comparePassword(_password))) return false

    try {
      this.setState(APP_STATE.WALLET_RESTORE)

      this.startSession()
      this.password = _password

      await this.stateStorageController.reset()
      this.setCurrentNetwork(options.networks[0])

      const isAdded = await this.addAccount(_account, true)
      if (!isAdded) return false

      logger.log(
        `(WalletController) Wallet restored with account: ${_account.name}`
      )

      this.setState(APP_STATE.WALLET_UNLOCKED)

      return true
    } catch (err) {
      logger.error(
        `(WalletController) Account during wallet restoring: ${err.message}`
      )
      return false
    }
  }

  /**
   *
   * Set a the wallet state
   *
   * @param {Integer} _state
   */
  setState(_state) {
    const currentState = this.getState('state')
    if (currentState === _state) return

    logger.log(
      `(WalletController) State updated: ${STATE_NAME[_state.toString()]}`
    )
    this.stateStorageController.set('state', _state)
  }

  /**
   *
   * Get the wallet state
   */
  getState() {
    return parseInt(this.stateStorageController.get('state'))
  }

  /**
   *
   * Function to access to the current seed.
   * Only if the password match will be possible to
   * access it. (API exposed)
   *
   * @param {String} _password
   */
  async unlockSeed(_password) {
    if (await this.comparePassword(_password)) return this.getCurrentSeed()
    return false
  }

  /**
   *
   * Internal function (not API exposed) to get the current seed
   */
  getCurrentSeed() {
    const account = this.getCurrentAccount()
    if (!account) return false

    return account.seed
  }

  /**
   *
   * Function to check if a wallet name already exists
   *
   * @param {String} _name
   */
  isAccountNameAlreadyExists(_name) {
    const accounts = this.stateStorageController.get('accounts')
    const alreadyExists = accounts.all.find(account => account.name === _name)
    return Boolean(alreadyExists)
  }

  /**
   *
   * Add an account within Pegaus
   *
   * @param {Object} _account
   * @param {Boolean} _isCurrent
   */
  async addAccount(_account, _isCurrent) {
    try {
      const accounts = this.stateStorageController.get('accounts')

      const id = Utils.sha256(_account.name)
      const alreadyExist = accounts.all.find(account => account.id === id)
      if (alreadyExist) return false

      const seed = _account.seed.toString().replace(/,/g, '')
      const network = this.getCurrentNetwork()

      // reset selectedAccount with new seed and current
      this._removeAccountListeners()
      this.selectedAccount.clear()
      this.selectedAccount = new PegasusAccount({
        seed,
        provider: network.provider
      })

      // fetch data for the current network
      const creations = []
      creations.push(
        new Promise((resolve, reject) => {
          this.selectedAccount
            .fetch()
            .then(_data =>
              resolve({
                data: _data,
                networkType: network.type
              })
            )
            .catch(_err => reject(_err))
        })
      )

      // fetch also data for not selected networks
      creations.push(
        ...NETWORK_TYPES.filter(
          _networkType => _networkType !== network.type
        ).map(_networkType => {
          const notSelectedNetwork = options.networks.find(
            _network => _network.type === _networkType
          )

          return new Promise((resolve, reject) => {
            new PegasusAccount({ seed, provider: notSelectedNetwork.provider })
              .getData()
              .then(_data =>
                resolve({
                  data: _data,
                  networkType: _networkType
                })
              )
              .catch(_err => reject(_err))
          })
        })
      )

      // wait all fetching
      const waitForCreations = _creations =>
        new Promise((resolve, reject) => {
          Promise.all(_creations)
            .then(_data => resolve(_data))
            .catch(_err => reject(_err))
        })

      // create the object containing data for each network type
      const networkData = await waitForCreations(creations)
      const networkedData = {}
      networkData.forEach(
        _data => (networkedData[_data.networkType] = _data.data)
      )

      const accountToAdd = {
        name: _account.name,
        avatar: _account.avatar,
        seed,
        data: networkedData,
        id
      }

      if (_isCurrent) accounts.selected = accountToAdd

      accounts.all.push(accountToAdd)

      this.stateStorageController.set('accounts', accounts)

      this.emit('accountChanged', accountToAdd.data[network.type].latestAddress)

      // in order to write on storage the first time
      await this.stateStorageController.lock()
      await this.stateStorageController.unlock(this.password)

      this._bindAccountListeners()
      this.selectedAccount.startFetch()

      logger.log(`(WalletController) Account added : ${accountToAdd.name}`)

      return true
    } catch (error) {
      this.selectedAccount.clear()

      logger.error(`(WalletController) Error during account creation: ${error}`)
      return false
    }
  }

  /**
   *
   * Function to get the current account only
   * if the wallet is unlocked
   *
   */
  getCurrentAccount() {
    if (this.getState() < APP_STATE.WALLET_UNLOCKED) return

    const accounts = this.stateStorageController.get('accounts')
    if (!accounts || !accounts.selected) return null

    return accounts.selected
  }

  /**
   *
   * Set the current wallet account
   *
   * @param {Object} _account
   */
  setCurrentAccount(_account) {
    const accounts = this.stateStorageController.get('accounts')

    // seed not exposed outside of the popup
    const account = accounts.all.find(acc => acc.id === _account.id)
    _account.seed = account.seed
    accounts.selected = _account

    const network = this.getCurrentNetwork()

    this._removeAccountListeners()
    this.selectedAccount.clear()
    this.selectedAccount = new PegasusAccount({ provider: network.provider })
    this.selectedAccount.setData(_account.seed, _account.data[network.type])
    this._bindAccountListeners()
    this.selectedAccount.startFetch()

    this.stateStorageController.set('accounts', accounts)

    this.emit('accountChanged', _account.data[network.type].latestAddress)

    logger.log(`(WalletController) Set current account : ${_account.name}`)
    return true
  }

  /**
   *
   * Update current account data
   *
   * @param {Object} _data
   */
  updateDataAccount(_data) {
    const accounts = this.stateStorageController.get('accounts')
    const network = this.getCurrentNetwork()

    accounts.all.forEach(account => {
      if (account.id === accounts.selected.id)
        account.data[network.type] = _data
    })
    accounts.selected.data[network.type] = _data

    this.stateStorageController.set('accounts', accounts)
    logger.log(`(WalletController) Data updated for ${accounts.selected.name}`)
    return true
  }

  /**
   *
   * Update current account name
   *
   * @param {String} _name
   */
  updateNameAccount(_name) {
    const accounts = this.stateStorageController.get('accounts')

    accounts.all.forEach(account => {
      if (account.id === accounts.selected.id) account.name = _name
    })
    accounts.selected.name = _name

    this.stateStorageController.set('accounts', accounts)
    logger.log(`(WalletController) Name updated for ${accounts.selected.name}`)
    return true
  }

  /**
   *
   * Update current account avatar
   *
   * @param {Integer} _avatar
   */
  updateAvatarAccount(_avatar) {
    const accounts = this.stateStorageController.get('accounts')

    accounts.all.forEach(account => {
      if (account.id === accounts.selected.id) account.avatar = _avatar
    })
    accounts.selected.avatar = _avatar

    this.stateStorageController.set('accounts', accounts)
    logger.log(
      `(WalletController) Avatar updated for ${accounts.selected.name}`
    )
    return true
  }

  /**
   *
   * Delete an account from the wallet
   *
   * @param {Object} _account
   */
  deleteAccount(_account) {
    const accounts = this.stateStorageController.get('accounts')

    if (accounts.all.length === 1) return false

    accounts.all = accounts.all.filter(account => account.id !== _account.id)

    logger.log(`(WalletController) Deleted account ${_account.name}`)

    accounts.selected = accounts.all[0]
    this.stateStorageController.set('accounts', accounts)

    const network = this.getCurrentNetwork()

    this.selectedAccount.clear()
    this._removeAccountListeners()
    this.selectedAccount = new PegasusAccount({ provider: network.provider })
    this.selectedAccount.setData(
      accounts.selected.seed,
      accounts.selected.data[network.type]
    )
    this._bindAccountListeners()
    this.selectedAccount.startFetch()

    this.emit(
      'accountChanged',
      accounts.selected.data[network.type].latestAddress
    )

    return true
  }

  /**
   *
   * Get all accounts removing the seed from
   * the object since it's possible that this function
   * is called from an internalConnection (ex: popup)
   */
  getAllAccounts() {
    const accounts = this.stateStorageController.get('accounts')
    return accounts.all.map(_account => removeSeed(_account))
  }

  /**
   *
   * Set popup settings
   *
   * @param {Object} _settings
   */
  setSettings(_settings) {
    this.stateStorageController.set('settings', _settings, true)
  }

  /**
   *
   * Get poup settings
   */
  getSettings() {
    return this.stateStorageController.get('settings')
  }

  /**
   *
   * Set the current network. This function is exposed (with API)
   *
   * @param {Object} _network
   */
  setCurrentNetwork(_network) {
    try {
      this.stateStorageController.set('selectedNetwork', _network)

      this.emit('providerChanged', _network.provider)

      logger.log(
        `(WalletController) New selected provider ${_network.provider}`
      )
    } catch (err) {
      throw new Error(err)
    }
  }

  /**
   *
   * Get current network
   */
  getCurrentNetwork() {
    return this.stateStorageController.get('selectedNetwork')
  }

  /**
   *
   * Get all networks
   */
  getAllNetworks() {
    return this.stateStorageController.get('networks')
  }

  /**
   *
   * Add a network. This function is exposed (with API)
   *
   * @param {Object} _network
   */
  addNetwork(_network) {
    try {
      const networks = this.stateStorageController.get('networks')

      const alreadyExists = networks.find(
        network => network.name === _network.name
      )
      if (alreadyExists) return false

      networks.push(_network)
      this.stateStorageController.set('networks', networks)

      this.emit('providerChanged', _network.provider)

      logger.log(`(WalletController) New provider added ${_network.provider}`)

      return true
    } catch (err) {
      throw new Error(err)
    }
  }

  /**
   *
   * Delete the current network selected
   */
  deleteCurrentNetwork() {
    try {
      let networks = this.stateStorageController.get('networks')
      const currentNetwork = this.stateStorageController.get('selectedNetwork')

      networks = networks.filter(
        network => currentNetwork.name !== network.name
      )

      const selectedNetwork = networks[0]

      this.stateStorageController.set('networks', networks)
      this.stateStorageController.set('selectedNetwork', selectedNetwork)

      this.emit('providerChanged', selectedNetwork.provider)

      logger.log(
        `(WalletController) Deleted provider ${currentNetwork.provider}`
      )

      return currentNetwork
    } catch (err) {
      throw new Error(err)
    }
  }

  /**
   *
   * Start a session
   */
  startSession() {
    this.session = new Date().getTime()
    this.sessionInterval = setInterval(
      () => this.checkSession(),
      SESSION_TIME_CHECK
    )
  }

  /**
   *
   * Check the correctness of the current session
   */
  checkSession() {
    const currentState = this.getState()

    if (!this.password && !this.isWalletSetup()) {
      this.setState(APP_STATE.WALLET_NOT_INITIALIZED)
      return
    }

    if (
      !this.password &&
      currentState !== APP_STATE.WALLET_RESTORE &&
      currentState !== APP_STATE.WALLET_NOT_INITIALIZED
    ) {
      logger.log('(WalletController) Wallet locked')
      return
    }

    if (this.getInternalConnections() > 0) {
      this.session = new Date().getTime()
      return
    }

    /*const requests = this.requestsController.getRequests()
    const requestWitUserInteraction = requests.filter(
      request => request.needUserInteraction
    )
    if (
      requestWitUserInteraction.length === 0 &&
      currentState === APP_STATE.WALLET_REQUEST_IN_QUEUE_WITH_USER_INTERACTION
    ) {
      logger.log(
        '(WalletController) found state = WALLET_REQUEST_IN_QUEUE_WITH_USER_INTERACTION with requests = 0 -> set to WALLET_UNLOCKED'
      )
      this.setState(APP_STATE.WALLET_UNLOCKED)
      return
    }*/

    if (this.session) {
      const date = new Date()
      const currentTime = date.getTime()

      const { autoLocking } = this.getSettings()

      // NOTE: if auto locking is enabled check the session
      if (autoLocking.enabled) {
        if (currentTime - this.session > autoLocking.time * 60 * 1000) {
          if (currentState >= APP_STATE.WALLET_UNLOCKED) {
            this.lockWallet()
            logger.log(
              '(WalletController) Session expired... Locking the wallet'
            )
          }
          return
        }
      }
    }
  }

  /**
   *
   * Delete current session
   */
  deleteSession() {
    this.session = null
    clearInterval(this.sessionInterval)
  }

  /**
   *
   * Derive the login password from _password and store
   * it. Store also only _password which will be used to derive
   * another key used to encrypt the content of the storage
   * with browser-protector (AES-GCM256 + argoin2id)
   *
   * @param {Password} _password
   */
  async storePassword(_password) {
    const result = await argon2.hash({
      pass: _password,
      salt: crypto.randomBytes(16),
      time: 9,
      mem: 16384,
      hashLen: 32,
      parallelism: 2,
      type: argon2.ArgonType.Argon2id,
      distPath: ''
    })

    this.password = _password
    this.stateStorageController.set('hpsw', result.encoded, true)
  }

  /**
   *
   * Check if the login password is correct by checking the hash
   * previously stored
   *
   * @param {String} _password
   */
  comparePassword(_password) {
    const encoded = this.stateStorageController.get('hpsw')

    return new Promise(resolve => {
      argon2
        .verify({
          pass: _password,
          encoded
        })
        .then(() => resolve(true))
        .catch(() => resolve(false))
    })
  }

  /**
   *
   * Check if the wallet is unlocked
   */
  isUnlocked() {
    return Boolean(this.password)
  }
}

export default WalletController
