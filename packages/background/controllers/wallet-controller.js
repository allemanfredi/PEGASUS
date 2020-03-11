import { backgroundMessanger } from '@pegasus/utils/messangers'
import { APP_STATE, STATE_NAME } from '@pegasus/utils/states'
import Utils from '@pegasus/utils/utils'
import { composeAPI } from '@iota/core'
import logger from '@pegasus/utils/logger'

class WalletController {
  constructor(options) {
    const {
      stateStorageController,
      networkController,
      connectorController
    } = options

    this.password = null

    this.stateStorageController = stateStorageController
    this.networkController = networkController
    this.connectorController = connectorController
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

  storePassword(_password) {
    const hash = Utils.sha256(_password)
    this.password = _password
    this.stateStorageController.set('hpsw', hash, true)
  }

  getPassword() {
    return this.password
  }

  setPassword(_password) {
    this.password = _password
  }

  comparePassword(_password) {
    let pswToCompare
    if ((pswToCompare = this.stateStorageController.get('hpsw')) === null)
      return false
    if (pswToCompare === Utils.sha256(_password)) return true
  }

  initWallet(_password) {
    this.storePassword(_password)

    this.stateStorageController.unlock(_password)
    this.accountDataController.startHandle()
    this.sessionController.startSession()

    logger.log(`(WalletController) Wallet initialized`)
  }

  unlockWallet(_password) {
    if (this.comparePassword()) {
      this.password = _password

      this.setState(APP_STATE.WALLET_UNLOCKED)
      const account = this.getCurrentAccount()
      const network = this.networkController.getCurrentNetwork()

      this.stateStorageController.unlock(_password)
      this.sessionController.startSession()
      this.accountDataController.startHandle()

      //injection
      backgroundMessanger.setSelectedProvider(network.provider)

      backgroundMessanger.setAccount(account)

      logger.log(
        `(WalletController) Wallet unlocked with account: ${account.name}`
      )
      return true
    }

    return false
  }

  lockWallet() {
    this.password = null
    this.setState(APP_STATE.WALLET_LOCKED)
    this.stateStorageController.lock()
    this.sessionController.deleteSession()
    this.accountDataController.stopHandle()

    backgroundMessanger.setAccount(null)
    backgroundMessanger.setSelectedAccount(null)

    logger.log(`(WalletController) Wallet succesfully locked`)
    return true
  }

  async restoreWallet(_account, _network, _password) {
    if (!this.unlockWallet(_password)) throw new Error('Invalid Password')

    try {
      this.stateStorageController.reset()
      this.networkController.setCurrentNetwork(_network)

      const isAdded = await this.addAccount(_account)
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
    backgroundMessanger.setAppState(_state)
  }

  getState() {
    return parseInt(this.stateStorageController.get('state'))
  }

  unlockSeed(_password) {
    if (this.comparePassword(_password)) return this.getCurrentSeed()
    return false
  }

  getKey() {
    return this.password
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
      //this.stateStorageController.writeToStorage()

      backgroundMessanger.setAccount(accountToAdd)

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
    const state = this.getState()
    if (state < APP_STATE.WALLET_UNLOCKED) return null

    if (!this.stateStorageController) return null

    const accounts = this.stateStorageController.get('accounts')
    if (accounts.length === 0 && state === APP_STATE.WALLET_NOT_INITIALIZED)
      return null

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
        backgroundMessanger.setAccount(account)

        logger.log(`(WalletController) Set current account : ${account.name}`)
        backgroundMessanger.setSelectedAccount(account.data.latestAddress)
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
    backgroundMessanger.setAccount(updatedAccount)

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
    backgroundMessanger.setAccount(updatedAccount)
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
    backgroundMessanger.setAccount(accounts[0])

    //injection
    backgroundMessanger.setSelectedAccount(accounts[0].data.latestAddress)

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
}

export default WalletController
