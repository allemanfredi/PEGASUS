import { APP_STATE, STATE_NAME } from '@pegasus/utils/states'
import Utils from '@pegasus/utils/utils'
import logger from '@pegasus/utils/logger'
import options from '@pegasus/utils/options'
import { EventEmitter } from 'eventemitter3'
import PegasusAccount from '../lib/pegasus-account'
import { NETWORK_TYPES } from '../lib/constants'
import { removeSeed } from '../lib/removers'

class WalletController extends EventEmitter {
  constructor(options) {
    super()

    const {
      stateStorageController,
      networkController,
      connectorController,
      loginPasswordController
    } = options

    this.stateStorageController = stateStorageController
    this.networkController = networkController
    this.connectorController = connectorController
    this.loginPasswordController = loginPasswordController

    this.networkController.on('providerChanged', _provider => {
      if (this.getState() > APP_STATE.WALLET_LOCKED)
        this.selectedAccount.setProvider(_provider)
    })

    this.selectedAccount = new PegasusAccount({
      provider: this.networkController.getCurrentNetwork().provider
    })
    this.selectedAccount.on('data', e => console.log('djdndhdhdbddatatdt'))
  }

  setSessionController(_sessionController) {
    this.sessionController = _sessionController
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

      await this.loginPasswordController.storePassword(_password)

      await this.stateStorageController.unlock(_password)

      const isCreated = await this.addAccount(_account, true)
      if (!isCreated) return false

      this.setState(APP_STATE.WALLET_INITIALIZED)

      // in order to write on storage the first time
      await this.stateStorageController.lock()
      await this.stateStorageController.unlock(_password)

      this.selectedAccount.startFetch()
      this.sessionController.startSession()

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
    if (await this.loginPasswordController.comparePassword(_password)) {
      this.sessionController.startSession()

      this.loginPasswordController.setPassword(_password)

      await this.stateStorageController.unlock(_password)

      this.setState(APP_STATE.WALLET_UNLOCKED)

      const account = this.getCurrentAccount()
      const network = this.networkController.getCurrentNetwork()

      this.selectedAccount.setProvider(network.provider)
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
    this.loginPasswordController.setPassword(null)
    this.setState(APP_STATE.WALLET_LOCKED)
    await this.stateStorageController.lock()
    this.sessionController.deleteSession()
    this.selectedAccount.stopFetch()

    if (this.selectedAccount) {
      this.selectedAccount.stopFetch()
      this.selectedAccount = null
    }

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
    if (!(await this.loginPasswordController.comparePassword(_password)))
      return false

    try {
      this.setState(APP_STATE.WALLET_RESTORE)

      this.sessionController.startSession()
      this.loginPasswordController.setPassword(_password)
      this.selectedAccount.startFetch()

      await this.stateStorageController.reset()
      this.networkController.setCurrentNetwork(options.networks[0])

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
    if (await this.loginPasswordController.comparePassword(_password))
      return this.getCurrentSeed()
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
      const network = this.networkController.getCurrentNetwork()

      // reset selectedAccount with new seed and current network
      this.selectedAccount.stopFetch()
      this.selectedAccount.setSeed(seed)
      this.selectedAccount.setProvider(network.provider)

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

      console.log(networkedData)

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
      const password = this.loginPasswordController.getPassword()
      await this.stateStorageController.lock()
      await this.stateStorageController.unlock(password)

      logger.log(`(WalletController) Account added : ${accountToAdd.name}`)

      return true
    } catch (error) {
      if (this.selectedAccount) {
        this.selectedAccount.stopFetch()
        this.selectedAccount = null
      }

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

    this.stateStorageController.set('accounts', accounts)

    const network = this.networkController.getCurrentNetwork()

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
    const network = this.networkController.getCurrentNetwork()

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

    const network = this.networkController.getCurrentNetwork()
    this.emit(
      'accountChanged',
      accounts.selected.data[network.type].latestAddress
    )

    return true
  }

  /**
   * 
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
}

export default WalletController
