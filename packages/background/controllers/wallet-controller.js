import { backgroundMessanger } from '@pegasus/utils/messangers'
import Duplex from '@pegasus/utils/duplex'
import { APP_STATE } from '@pegasus/utils/states'
import Utils from '@pegasus/utils/utils'
import { composeAPI } from '@iota/core'

class WalletController {

  constructor(options){

    const {
      storageController,
      networkController,
      connectorController
    } = options

    this.password = null

    this.storageController = storageController
    this.networkController = networkController
    this.connectorController = connectorController

    const duplex = new Duplex.Host()
    backgroundMessanger.init(duplex)
  }

  isWalletSetup () {
    const state = this.getState()
    if (state >= APP_STATE.WALLET_INITIALIZED) {
      return true
    }

    return false
  }

  setupWallet () {
    this.setState(APP_STATE.WALLET_NOT_INITIALIZED)
  }

  storePassword (psw) {
    const hash = Utils.sha256(psw)
    this.password = psw
    this.storageController.setPasswordHash(hash)
  }

  comparePassword (psw) {
    let pswToCompare
    if ((pswToCompare = this.storageController.getPasswordHash()) === null)
      return false
    if (pswToCompare === Utils.sha256(psw))
      return true
  }

  setPassword (password) {
    this.password = password
  }

  getPassword() {
    return this.password
  }

  unlockWallet (psw) {
    const hash = Utils.sha256(psw)
    let pswToCompare

    if ((pswToCompare = this.storageController.getPasswordHash()) === null) {
      return false
    }

    if (pswToCompare === hash) {
      this.setState(APP_STATE.WALLET_UNLOCKED)
      const account = this.getCurrentAccount()
      const network = this.networkController.getCurrentNetwork()

      //injection
      backgroundMessanger.setProvider(network.provider)
      backgroundMessanger.setAccount(account)

      return true
    }

    return false
  }

  restoreWallet (account, network, key) {
    const transactions = AccountDataController.mapTransactions(account.data, network)

    account.data.balance = network.type === 'mainnet'
      ? {
          mainnet: account.data.balance,
          testnet: 0,
        }
      : {
          mainnet: account.data.balance,
          testnet: 0
        }

    const eseed = Utils.aes256encrypt(account.seed, key)
    const obj = {
      name: account.name,
      seed: eseed,
      transactions,
      data: account.data,
      current: true,
      id: Utils.sha256(account.name)
    }

    try {
      const restoredData = []
      restoredData.push(obj)
      this.storageController.setData(restoredData)
      this.storageController.writeToStorage()

      this.password = key
      this.networkController.setCurrentNetwork(network)

      backgroundMessanger.setProvider(network.provider)
      backgroundMessanger.setAccount(obj)

      return obj
    } catch (err) {
      throw new Error(err)
    }
  }

  setState (state) {
    localStorage.setItem('state', state)
  }

  getState () {
    const state = parseInt(localStorage.getItem('state'))
    return state
  }

  unlockSeed (psw) {
    const hash = Utils.sha256(psw)
    let pswToCompare
    if ((pswToCompare = this.storageController.getPasswordHash()) === null)
      return false
    if (pswToCompare === hash) {
      const seed = this.getCurrentSeed()
      return seed
    }
    return null
  }

  getKey () {
    return this.password
  }

  getCurrentSeed () {
    const account = this.getCurrentAccount()
    if (!account)
      return null
      
    const key = this.getKey()
    const seed = Utils.aes256decrypt(account.seed, key)
    return seed
  }

  isAccountNameAlreadyExists (name) {
    const data = this.storageController.getData()
    const alreadyExists = data.filter(account => account.name === name)
    if (alreadyExists.length > 0) {
      return true
    } else {
      return false
    }
  }

  async addAccount (account, isCurrent) {

    if (isCurrent) {
      const data = this.storageController.getData()
      data.forEach(acc => { acc.current = false })
      this.storageController.setData(data)
    }

    const network = this.networkController.getCurrentNetwork()
    const iota = composeAPI({ provider: network.provider })
    const seed = account.seed.toString().replace(/,/g, '')
    const accountData = await iota.getAccountData(seed,
       { start: 0, security: 2 }
    )

    accountData.balance = {
      testnet: 0,
      mainnet: 0
    }

    const key = this.getKey()
    const eseed = Utils.aes256encrypt(seed, key)

    const accountToAdd = {
      name: account.name,
      avatar: account.avatar,
      seed: eseed,
      transactions: [],
      data: accountData,
      current: Boolean(isCurrent),
      id: Utils.sha256(account.name)
    }

    const data = this.storageController.getData()

    const alreadyExists = data.filter(a => a.id === accountToAdd.id)
    if (alreadyExists.length > 0) {
      return null
    }

    data.push(accountToAdd)
    this.storageController.setData(data)

    this.setState(APP_STATE.WALLET_UNLOCKED)

    backgroundMessanger.setProvider(network.provider)
    backgroundMessanger.setAccount(accountToAdd)
    return
  }

  getCurrentAccount () {
    const state = this.getState()
    if (state < APP_STATE.WALLET_UNLOCKED)
      return null
    
    if (!this.storageController)
      return null

    const accounts = this.storageController.getData()
    if (accounts.length === 0 && state === APP_STATE.WALLET_NOT_INITIALIZED)
      return null

    for (let account of accounts) {
      if (account.current)
        return account
    }
  }

  setCurrentAccount (currentAccount) {
    let currentData = this.storageController.getData()
    currentData.forEach(account => { account.current = false })
    this.storageController.setData(currentData)

    const data = this.storageController.getData()
    data.forEach(account => {
      if (account.id === currentAccount.id) {
        account.current = true
        backgroundMessanger.setAccount(account)
      }
    })
    this.storageController.setData(data)
  }

  resetData () {
    this.storageController.setData([])
  }

  updateDataAccount (updatedData) {
    const data = this.storageController.getData()
    let updatedAccount = {}
    data.forEach(account => {
      if (account.current) {
        account.data = updatedData
        updatedAccount = account
      }
    })
    this.storageController.setData(data)
    return updatedAccount
  }

  updateNetworkAccount (network) {
    const data = this.storageController.getData()
    let updatedAccount = {}
    data.forEach(account => {
      if (account.current) {
        account.network = network
        updatedAccount = account
      }
    })
    this.storageController.setData(data)
    return updatedAccount
  }

  updateTransactionsAccount (transactions) {
    const data = this.storageController.getData()

    let updatedAccount = {}
    data.forEach(account => {
      if (account.current) {
        account.transactions = transactions
        updatedAccount = account
      }
    })

    this.storageController.setData(data)
    return updatedAccount
  }

  updateNameAccount (current, newName) {
    const data = this.storageController.getData()
    for (let account of data) {
      if (account.name === newName) {
        return false
      }
    }

    let updatedAccount = {}
    data.forEach(account => {
      if (account.id === current.id) {
        account.name = newName
        account.id = Utils.sha256(newName)
        updatedAccount = account

        this.connectorController.updateConnectionsAccountId(current.id, Utils.sha256(newName))
      }
    })

    this.storageController.setData(data)
    backgroundMessanger.setAccount(updatedAccount)

    return true
  }

  updateAvatarAccount (current, avatar) {
    const data = this.storageController.getData()
    let updatedAccount = {}
    data.forEach(account => {
      if (account.id === current.id) {
        account['avatar'] = avatar
        updatedAccount = account
      }
    })

    this.storageController.setData(data)
    backgroundMessanger.setAccount(updatedAccount)
  }

  deleteAccount (account) {
    const data = this.storageController.getData()
    if (data.length === 1) { return null } else {
      const app = data.filter(acc => acc.id !== account.id)

      app.forEach(account => { account.current = false })

      app[0].current = true
      this.storageController.setData(app)
      backgroundMessanger.setAccount(app[0])
      return app[0]
    }
  }

  getAllAccounts () {
    const accounts = []

    this.storageController.getData().forEach(account => {
      accounts.push(account)
    })
    return accounts
  }

  generateSeed (length = 81) {
    const bytes = Utils.randomBytes(length, 27)
    const seed = bytes.map(byte => Utils.byteToChar(byte))
    return seed
  }

  isSeedValid (seed) {
    const values = ['9', 'A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z']
    if (seed.length !== 81)
      return false;
    [...seed].forEach(c => {
      if (values.indexOf(c) === -1)
        return false
    })
    return true 
  }

  logout() {
    backgroundMessanger.setAccount(null)
  }
}

export default WalletController