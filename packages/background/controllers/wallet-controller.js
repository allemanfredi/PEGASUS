import { APP_STATE, STATE_NAME } from '@pegasus/utils/states'
import Utils from '@pegasus/utils/utils'
import logger from '@pegasus/utils/logger'
import options from '@pegasus/utils/options'
import { EventEmitter } from 'eventemitter3'
import { setTransactionsReattach } from '../lib/account-data'

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
  }

  setSessionController(_sessionController) {
    this.sessionController = _sessionController
  }

  setAccountDataController(accountDataController) {
    this.accountDataController = accountDataController
  }

  isWalletSetup() {
    const state = this.getState()
    if (state >= APP_STATE.WALLET_INITIALIZED) {
      return true
    }

    return false
  }

  async initWallet(_password, _account) {
    try {
      this.stateStorageController.init(_password)

      await this.loginPasswordController.storePassword(_password)

      await this.stateStorageController.unlock(_password)

      const isCreated = await this.addAccount(_account, true)
      if (!isCreated) return false

      this.setState(APP_STATE.WALLET_INITIALIZED)

      //in order to write on storage the first time
      await this.stateStorageController.lock()
      await this.stateStorageController.unlock(_password)
      this.accountDataController.startHandle()
      this.sessionController.startSession()

      this.setState(APP_STATE.WALLET_UNLOCKED)

      logger.log(`(WalletController) Wallet initialized`)
      return true
    } catch (err) {
      logger.error(
        `(WalletController) Error during wallet initialization ${err.message}`
      )
      return false
    }
  }

  async unlockWallet(_password) {
    if (await this.loginPasswordController.comparePassword(_password)) {
      this.sessionController.startSession()

      this.loginPasswordController.setPassword(_password)

      await this.stateStorageController.unlock(_password)
      this.accountDataController.startHandle()

      this.setState(APP_STATE.WALLET_UNLOCKED)

      const account = this.getCurrentAccount()

      this.emit('accountChanged', account.data.latestAddress)

      logger.log(
        `(WalletController) Wallet unlocked with account: ${account.name}`
      )
      return true
    }

    return false
  }

  async lockWallet() {
    this.loginPasswordController.setPassword(null)
    this.setState(APP_STATE.WALLET_LOCKED)
    await this.stateStorageController.lock()
    this.sessionController.deleteSession()
    this.accountDataController.stopHandle()

    logger.log(`(WalletController) Wallet succesfully locked`)
    return true
  }

  async restoreWallet(_password, _account) {
    if (!(await this.loginPasswordController.comparePassword(_password)))
      return false

    try {
      this.setState(APP_STATE.WALLET_RESTORE)

      this.sessionController.startSession()
      this.loginPasswordController.setPassword(_password)
      this.accountDataController.startHandle()

      await this.stateStorageController.reset()
      this.networkController.setCurrentNetwork(options.networks[0])

      const isAdded = await this.addAccount(_account, true)
      if (!isAdded) {
        return false
      }

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

  setState(_state) {
    const currentState = this.getState('state')
    if (currentState === _state) return

    logger.log(
      `(WalletController) State updated: ${STATE_NAME[_state.toString()]}`
    )
    this.stateStorageController.set('state', _state)
  }

  getState() {
    return parseInt(this.stateStorageController.get('state'))
  }

  async unlockSeed(_password) {
    if (await this.loginPasswordController.comparePassword(_password))
      return this.getCurrentSeed()
    return false
  }

  getCurrentSeed() {
    const account = this.getCurrentAccount()
    if (!account) return false

    return account.seed
  }

  isAccountNameAlreadyExists(_name) {
    const accounts = this.stateStorageController.get('accounts')
    const alreadyExists = accounts.all.find(account => account.name === _name)
    return alreadyExists ? true : false
  }

  async addAccount(_account, _isCurrent) {
    try {
      const accounts = this.stateStorageController.get('accounts')

      const seed = _account.seed.toString().replace(/,/g, '')

      // NOTE: transaction mapping
      const accountData = await this.accountDataController.retrieveAccountData(
        seed
      )
      const transactionsWithReattachSet = setTransactionsReattach(
        accountData.transactions
      )
      accountData.transactions = transactionsWithReattachSet

      const id = Utils.sha256(_account.name)

      const accountToAdd = {
        name: _account.name,
        avatar: _account.avatar,
        seed,
        data: accountData,
        id
      }

      const alreadyExist = accounts.all.find(account => account.id === id)
      if (alreadyExist) {
        return false
      }

      if (_isCurrent) accounts.selected = accountToAdd

      accounts.all.push(accountToAdd)

      this.stateStorageController.set('accounts', accounts)

      this.emit('accountChanged', accountToAdd.data.latestAddress)

      //in order to write on storage the first time
      const password = this.loginPasswordController.getPassword()
      await this.stateStorageController.lock()
      await this.stateStorageController.unlock(password)

      logger.log(`(WalletController) Account added : ${accountToAdd.name}`)

      return true
    } catch (error) {
      logger.error(`(WalletController) Error during account creation: ${error}`)
      return false
    }
  }

  getCurrentAccount() {
    if (this.getState() < APP_STATE.WALLET_UNLOCKED) return

    const accounts = this.stateStorageController.get('accounts')
    if (!accounts || !accounts.selected) return null

    return accounts.selected
  }

  //all following methods updates data on the CURRENT account
  setCurrentAccount(_account) {
    const accounts = this.stateStorageController.get('accounts')

    //seed not exposed outside of the popup
    const account = accounts.all.find(acc => acc.id === _account.id)
    _account.seed = account.seed
    accounts.selected = _account

    this.stateStorageController.set('accounts', accounts)

    this.emit('accountChanged', _account.data.latestAddress)

    logger.log(`(WalletController) Set current account : ${_account.name}`)
    return true
  }

  updateDataAccount(_data) {
    const accounts = this.stateStorageController.get('accounts')

    accounts.all.forEach(account => {
      if (account.id === accounts.selected.id) account.data = _data
    })
    accounts.selected.data = _data

    this.stateStorageController.set('accounts', accounts)
    logger.log(`(WalletController) Data updated for ${accounts.selected.name}`)
    return true
  }

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

  deleteAccount(_account) {
    const accounts = this.stateStorageController.get('accounts')

    if (accounts.all.length === 1) {
      return false
    }

    accounts.all = accounts.all.filter(account => account.id !== _account.id)

    logger.log(`(WalletController) Deleted account ${_account.name}`)

    accounts.selected = accounts.all[0]
    this.stateStorageController.set('accounts', accounts)

    this.emit('accountChanged', accounts.selected.data.latestAddress)

    return true
  }

  getAllAccounts() {
    const accounts = this.stateStorageController.get('accounts')
    return accounts.all
  }

  setSettings(_settings) {
    this.stateStorageController.set('settings', _settings, true)
  }

  getSettings() {
    return this.stateStorageController.get('settings')
  }
}

export default WalletController
