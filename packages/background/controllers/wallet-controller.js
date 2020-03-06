import { backgroundMessanger } from '@pegasus/utils/messangers'
import Duplex from '@pegasus/utils/duplex'
import { APP_STATE } from '@pegasus/utils/states'
import Utils from '@pegasus/utils/utils'
import { composeAPI } from '@iota/core'

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

  setupWallet() {
    this.setState(APP_STATE.WALLET_NOT_INITIALIZED)
  }

  storePassword(psw) {
    const hash = Utils.sha256(psw)
    this.password = psw
    this.stateStorageController.set('hpsw', hash, true)
  }

  comparePassword(psw) {
    let pswToCompare
    if ((pswToCompare = this.stateStorageController.get('hpsw')) === null)
      return false
    if (pswToCompare === Utils.sha256(psw)) return true
  }

  setPassword(password) {
    this.password = password
  }

  getPassword() {
    return this.password
  }

  unlockWallet(psw) {
    const hash = Utils.sha256(psw)
    let pswToCompare

    if ((pswToCompare = this.stateStorageController.get('hpsw')) === null) {
      return false
    }

    if (pswToCompare === hash) {
      this.setState(APP_STATE.WALLET_UNLOCKED)
      const account = this.getCurrentAccount()
      const network = this.networkController.getCurrentNetwork()

      this.stateStorageController.setEncryptionKey(psw)

      //injection
      backgroundMessanger.setSelectedProvider(network.provider)

      backgroundMessanger.setAccount(account)
      return true
    }

    return false
  }

  async restoreWallet(account, network, key) {
    const transactions = await this.accountDataController.mapTransactions(
      account.data,
      network
    )

    account.data.balance =
      network.type === 'mainnet'
        ? {
            mainnet: account.data.balance,
            testnet: 0
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
      this.stateStorageController.setEncryptionKey(key)

      const restoredAccounts = []
      restoredAccounts.push(obj)
      this.stateStorageController.set('accounts', restoredAccounts)
      this.stateStorageController.writeToStorage()

      this.password = key
      this.networkController.setCurrentNetwork(network)

      backgroundMessanger.setAccount(obj)

      return true
    } catch (err) {
      return false
    }
  }

  setState(state) {
    this.stateStorageController.set('state', state)
  }

  getState() {
    return parseInt(this.stateStorageController.get('state'))
  }

  unlockSeed(psw) {
    const hash = Utils.sha256(psw)
    let pswToCompare
    if (!(pswToCompare = this.stateStorageController.get('hpsw'))) return false
    if (pswToCompare === hash) {
      return this.getCurrentSeed()
    }
    return false
  }

  getKey() {
    return this.password
  }

  getCurrentSeed() {
    const account = this.getCurrentAccount()
    if (!account) return false

    const key = this.getKey()
    return Utils.aes256decrypt(account.seed, key)
  }

  isAccountNameAlreadyExists(name) {
    const accounts = this.stateStorageController.get('accounts')
    const alreadyExists = accounts.filter(account => account.name === name)
    if (alreadyExists.length > 0) {
      return true
    } else {
      return false
    }
  }

  async addAccount(account, isCurrent) {
    try {
      if (isCurrent) {
        const accounts = this.stateStorageController.get('accounts')
        accounts.forEach(user => {
          user.current = false
        })
        this.stateStorageController.set('accounts', accounts)
      }

      const network = this.networkController.getCurrentNetwork()
      const iota = composeAPI({ provider: network.provider })
      const seed = account.seed.toString().replace(/,/g, '')

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

      const key = this.getKey()
      const eseed = Utils.aes256encrypt(seed, key)

      const transactions = await this.accountDataController.mapTransactions(
        accountData,
        network
      )

      const accountToAdd = {
        name: account.name,
        avatar: account.avatar,
        seed: eseed,
        transactions,
        data: accountData,
        current: Boolean(isCurrent),
        id: Utils.sha256(account.name)
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

      this.setState(APP_STATE.WALLET_UNLOCKED)

      backgroundMessanger.setAccount(accountToAdd)

      return true
    } catch (err) {
      console.log(err)
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

  setCurrentAccount(currentAccount) {
    let currentsAccount = this.stateStorageController.get('accounts')
    currentsAccount.forEach(account => {
      account.current = false
    })
    this.stateStorageController.set('accounts', currentsAccount)

    const accounts = this.stateStorageController.get('accounts')
    accounts.forEach(account => {
      if (account.id === currentAccount.id) {
        account.current = true
        backgroundMessanger.setAccount(account)

        //injection
        const website = this.connectorController.getCurrentWebsite()

        if (!website) {
          this.stateStorageController.set('accounts', accounts)
          return
        }

        const connection = this.connectorController.getConnection(
          website.origin
        )
        if (connection && connection.enabled) {
          backgroundMessanger.setSelectedAccount(account.data.latestAddress)
        }
      }
    })
    this.stateStorageController.set('accounts', accounts)
  }

  resetData() {
    this.stateStorageController.set('accounts', [])
  }

  updateDataAccount(updatedData) {
    const accounts = this.stateStorageController.get('accounts')
    let updatedAccount = {}
    accounts.forEach(account => {
      if (account.current) {
        account.data = updatedData
        updatedAccount = account
      }
    })
    this.stateStorageController.set('accounts', accounts)
    return updatedAccount
  }

  updateNetworkAccount(network) {
    const accounts = this.stateStorageController.get('accounts')
    let updatedAccount = {}
    accounts.forEach(account => {
      if (account.current) {
        account.network = network
        updatedAccount = account
      }
    })
    this.stateStorageController.set('accounts', accounts)
    return updatedAccount
  }

  updateTransactionsAccount(transactions) {
    const accounts = this.stateStorageController.get('accounts')

    let updatedAccount = {}
    accounts.forEach(account => {
      if (account.current) {
        account.transactions = transactions
        updatedAccount = account
      }
    })

    this.stateStorageController.set('accounts', accounts)
    return updatedAccount
  }

  updateNameAccount(current, newName) {
    const accounts = this.stateStorageController.get('accounts')
    for (let account of accounts) {
      if (account.name === newName) {
        return false
      }
    }

    let updatedAccount = {}
    accounts.forEach(account => {
      if (account.id === current.id) {
        account.name = newName
        account.id = Utils.sha256(newName)
        updatedAccount = account

        this.connectorController.updateConnectionsAccountId(
          current.id,
          Utils.sha256(newName)
        )
      }
    })

    this.stateStorageController.set('accounts', accounts)
    backgroundMessanger.setAccount(updatedAccount)

    return true
  }

  updateAvatarAccount(current, avatar) {
    const accounts = this.stateStorageController.get('accounts')
    let updatedAccount = {}
    accounts.forEach(account => {
      if (account.id === current.id) {
        account['avatar'] = avatar
        updatedAccount = account
      }
    })

    this.stateStorageController.set('accounts', accounts)
    backgroundMessanger.setAccount(updatedAccount)
  }

  async deleteAccount(account) {
    let accounts = this.stateStorageController.get('accounts')

    if (accounts.length === 1) {
      return false
    }

    accounts = accounts.filter(acc => acc.id !== account.id)

    accounts.forEach(account => {
      account.current = false
    })

    accounts[0].current = true
    this.stateStorageController.set('accounts', accounts)
    backgroundMessanger.setAccount(accounts[0])

    //injection
    const website = this.connectorController.getCurrentWebsite()
    if (!website) {
      return true
    }

    const connection = this.connectorController.getConnection(website.origin)
    if (connection && connection.enabled) {
      backgroundMessanger.setSelectedAccount(accounts[0].data.latestAddress)
    }

    return true
  }

  getAllAccounts() {
    const accounts = []

    this.stateStorageController.get('accounts').forEach(account => {
      accounts.push(account)
    })
    return accounts
  }

  generateSeed(length = 81) {
    const bytes = Utils.randomBytes(length, 27)
    const seed = bytes.map(byte => Utils.byteToChar(byte))
    return seed
  }

  isSeedValid(seed) {
    const values = [
      '9',
      'A',
      'B',
      'C',
      'D',
      'E',
      'F',
      'G',
      'H',
      'I',
      'J',
      'K',
      'L',
      'M',
      'N',
      'O',
      'P',
      'Q',
      'R',
      'S',
      'T',
      'U',
      'V',
      'W',
      'X',
      'Y',
      'Z'
    ]
    if (seed.length !== 81) return false
    ;[...seed].forEach(c => {
      if (values.indexOf(c) === -1) return false
    })
    return true
  }

  logout() {
    backgroundMessanger.setAccount(null)
    backgroundMessanger.setSelectedAccount(null)
  }
}

export default WalletController
