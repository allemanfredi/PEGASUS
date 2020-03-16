import { APP_STATE, STATE_NAME } from '@pegasus/utils/states'
import Utils from '@pegasus/utils/utils'
import { composeAPI } from '@iota/core'
import logger from '@pegasus/utils/logger'
import options from '@pegasus/utils/options'

class WalletController {
  constructor(options) {
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
      this.loginPasswordController.setPassword(_password)

      await this.stateStorageController.unlock(_password)
      this.sessionController.startSession()
      this.accountDataController.startHandle()

      this.setState(APP_STATE.WALLET_UNLOCKED)

      const account = this.getCurrentAccount()
      const network = this.networkController.getCurrentNetwork()

      //background.setSelectedProvider(network.provider)
      //background.setAccount(account)

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

    //background.setAccount(null)
    //background.setSelectedAccount(null)

    logger.log(`(WalletController) Wallet succesfully locked`)
    return true
  }

  async restoreWallet(_password, _account) {
    if (!(await this.unlockWallet(_password)))
      throw new Error('Invalid Password')

    try {
      await this.stateStorageController.reset()
      this.networkController.setCurrentNetwork(options.networks[0])

      const isAdded = await this.addAccount(_account, true)
      if (!isAdded) return false

      logger.log(
        `(WalletController) Wallet restored with account: ${_account.name}`
      )
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
    //background.setAppState(_state)
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

    return account.seed //Utils.aes256decrypt(account.seed, key)
  }

  isAccountNameAlreadyExists(_name) {
    const accounts = this.stateStorageController.get('accounts')
    const alreadyExists = accounts.filter(account => account.name === _name)
    if (alreadyExists.length > 0) {
      return true
    } else {
      return false
    }
  }

  async addAccount(_account, _isCurrent) {
    try {
      if (_isCurrent) {
        const accounts = this.stateStorageController.get('accounts')
        accounts.forEach(user => {
          user.current = false
        })
        this.stateStorageController.set('accounts', accounts)
      }

      const network = this.networkController.getCurrentNetwork()
      const iota = composeAPI({ provider: network.provider })
      const seed = _account.seed.toString().replace(/,/g, '')

      let accountData = await iota.getAccountData(seed, {
        start: 0,
        security: 2
      })

      const balance = accountData.balance
      accountData.balance =
        network.type === 'mainnet'
          ? {
              mainnet: balance,
              testnet: 0
            }
          : {
              mainnet: 0,
              testnet: balance
            }

      const transactions = await this.accountDataController.mapTransactions(
        accountData,
        network
      )
      const transactionsWithReattachSet = this.accountDataController.setTransactionsReattach(
        transactions
      )

      const accountToAdd = {
        name: _account.name,
        avatar: _account.avatar,
        seed,
        transactions: transactionsWithReattachSet,
        data: accountData,
        current: Boolean(_isCurrent),
        id: Utils.sha256(_account.name)
      }

      const accounts = this.stateStorageController.get('accounts')

      const alreadyExists = accounts.find(
        account => account.id === accountToAdd.id
      )
      if (alreadyExists) {
        return false
      }

      accounts.push(accountToAdd)
      this.stateStorageController.set('accounts', accounts)

      //background.setAccount(accountToAdd)

      logger.log(`(WalletController) Account added : ${accountToAdd.name}`)

      return true
    } catch (error) {
      logger.error(
        `(WalletController) Account during account creation: ${error}`
      )
      return false
    }
  }

  getCurrentAccount() {
    if (this.getState() < APP_STATE.WALLET_UNLOCKED) return

    const accounts = this.stateStorageController.get('accounts')
    if (accounts.length === 0) return null

    for (let account of accounts) {
      if (account.current) {
        return account
      }
    }
  }

  setCurrentAccount(_currentAccount) {
    let currentsAccount = this.stateStorageController.get('accounts')
    currentsAccount.forEach(account => {
      account.current = false
    })
    this.stateStorageController.set('accounts', currentsAccount)

    const accounts = this.stateStorageController.get('accounts')
    accounts.forEach(account => {
      if (account.id === _currentAccount.id) {
        account.current = true
        //background.setAccount(account)

        logger.log(`(WalletController) Set current account : ${account.name}`)
        //background.setSelectedAccount(account.data.latestAddress)
      }
    })
    this.stateStorageController.set('accounts', accounts)
  }

  updateDataAccount(_updatedData) {
    const accounts = this.stateStorageController.get('accounts')
    let updatedAccount = {}
    accounts.forEach(account => {
      if (account.current) {
        account.data = _updatedData
        updatedAccount = account

        logger.log(`(WalletController) Update account data for ${account.name}`)
      }
    })

    this.stateStorageController.set('accounts', accounts)
    return updatedAccount
  }

  updateTransactionsAccount(_transactions) {
    const accounts = this.stateStorageController.get('accounts')

    let updatedAccount = {}
    accounts.forEach(account => {
      if (account.current) {
        account.transactions = _transactions
        updatedAccount = account

        logger.log(`(WalletController) Update transactions for ${account.name}`)
      }
    })

    this.stateStorageController.set('accounts', accounts)
    return updatedAccount
  }

  updateNameAccount(_current, _newName) {
    const accounts = this.stateStorageController.get('accounts')
    for (let account of accounts) {
      if (account.name === _newName) {
        return false
      }
    }

    let updatedAccount = {}
    accounts.forEach(account => {
      if (account.id === _current.id) {
        logger.log(
          `(WalletController) Update name for ${account.name} with new one: ${_newName}`
        )

        account.name = _newName
        account.id = Utils.sha256(_newName)
        updatedAccount = account
      }
    })

    this.stateStorageController.set('accounts', accounts)
    //background.setAccount(updatedAccount)

    return true
  }

  updateAvatarAccount(_current, _avatar) {
    const accounts = this.stateStorageController.get('accounts')
    let updatedAccount = {}
    accounts.forEach(account => {
      if (account.id === _current.id) {
        account['avatar'] = _avatar
        updatedAccount = account

        logger.log(`(WalletController) Update avatar for ${account.name}`)
      }
    })

    this.stateStorageController.set('accounts', accounts)
    //background.setAccount(updatedAccount)
  }

  async deleteAccount(_account) {
    let accounts = this.stateStorageController.get('accounts')

    if (accounts.length === 1) {
      return false
    }

    accounts = accounts.filter(account => account.id !== _account.id)

    accounts.forEach(account => {
      account.current = false
    })

    logger.log(`(WalletController) Deleted account ${_account.name}`)

    accounts[0].current = true
    this.stateStorageController.set('accounts', accounts)
    //background.setAccount(accounts[0])

    //injection
    //background.setSelectedAccount(accounts[0].data.latestAddress)

    return true
  }

  getAllAccounts() {
    const accounts = []

    this.stateStorageController.get('accounts').forEach(account => {
      accounts.push(account)
    })
    return accounts
  }

  generateSeed(_length = 81) {
    const bytes = Utils.randomBytes(_length, 27)
    const seed = bytes.map(byte => Utils.byteToChar(byte))
    return seed
  }

  setPopupSettings(_settings) {
    this.stateStorageController.set('popupSettings', _settings, true)
  }

  getPopupSettings() {
    return this.stateStorageController.get('popupSettings')
  }
}

export default WalletController
