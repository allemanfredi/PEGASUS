
import EventEmitter from 'eventemitter3'
import extensionizer from 'extensionizer'
import Utils from '@pegasus/lib/utils'
import { BackgroundAPI } from '@pegasus/lib/api'
import { APP_STATE } from '@pegasus/lib/states'
import { composeAPI } from '@iota/core'
import { asciiToTrytes } from '@iota/converter'
import settings from '@pegasus/lib/options'
import AccountDataService from '../AccountDataService'
import CustomizatorService from '../CustomizatorService'
import MamService from '../MamService'
import StorageDataService from '../StorageDataService'
import NotificationsService from '../NotificationsService'

class Wallet extends EventEmitter {
  constructor () {
    super()

    this.popup = false
    this.payments = []
    this.requests = []
    this.password = false
    this.accountDataHandler = false

    if (!this.isWalletSetup())
      this.setupWallet()

    const currentNetwork = this.getCurrentNetwork()
    if (Object.entries(currentNetwork).length === 0 && currentNetwork.constructor === Object) {
      settings.networks.forEach(network => this.addNetwork(network))
      this.customizatorService = Utils.requestHandler(new CustomizatorService(settings.networks[0].provider))
      this.setCurrentNetwork(settings.networks[0])
    } else {
      this.customizatorService = Utils.requestHandler(new CustomizatorService(currentNetwork.provider))
    }

    this.notificationsService = new NotificationsService()

    this.checkSession()
    setInterval(() => this.checkSession(), 9000000)
  }

  isWalletSetup () {
    try {
      const state = this.getState()
      if (state >= APP_STATE.WALLET_INITIALIZED)
        return true
      return false
    } catch (err) {
      return false
    }
  }

  setupWallet () {
    try {
      this.setState(APP_STATE.WALLET_NOT_INITIALIZED)
      return true
    } catch (err) {
      this.setState(APP_STATE.WALLET_NOT_INITIALIZED)
      return false
    }
  }

  initStorageDataService (key) {
    // allow to encrypt/decrypt the wallet
    if (!this.storageDataService) {
      this.storageDataService = new StorageDataService(key)
    } else {
      this.storageDataService.setEncryptionKey(key)
    }
  }

  writeDataToLocalStorage() {
    if (this.storageDataService) {
      this.storageDataService.writeDataToStorage()
    }
  }

  storePassword (psw) {
    const hash = Utils.sha256(psw)
    try {
      this.password = psw
      localStorage.setItem('hpsw', hash)
      return true
    } catch (err) {
      console.log(err)
      return false
    }
  }

  comparePassword (psw) {
    let pswToCompare
    if ((pswToCompare = localStorage.getItem('hpsw')) === null)
      return false
    if (pswToCompare === Utils.sha256(psw))
      return true
  }

  setPassword (password) {
    this.password = password
  }

  unlockWallet (psw) {
    const hash = Utils.sha256(psw)
    try {
      let pswToCompare
      if ((pswToCompare = localStorage.getItem('hpsw')) === null)
        return false
      if (pswToCompare === hash) {
        const account = this.getCurrentAccount()
        const network = this.getCurrentNetwork()
        this.emit('setAccount', account)

        //injection
        this.emit('setAddress', account.data.latestAddress)
        this.emit('setProvider', network.provider)
        return true
      }
      return false
    } catch (err) {
      console.log(err)
      return false
    }
  }

  restoreWallet ({ account, network, key }) {
    const transactions = AccountDataService.mapTransactions(account.data, network)
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
      this.storageDataService.setData(restoredData)
      this.storageDataService.writeDataToStorage()

      this.password = key
      this.setCurrentNetwork(network)

      this.emit('setProvider', network.provider)
      this.emit('setAddress', account.data.latestAddress)
      this.emit('setAccount', obj)

      return obj
    } catch (err) {
      throw new Error(err)
    }
  }

  unlockSeed (psw) {
    const hash = Utils.sha256(psw)
    try {
      let pswToCompare
      if ((pswToCompare = localStorage.getItem('hpsw')) === null)
        return false
      if (pswToCompare === hash) {
        const seed = this.getCurrentSeed()
        return seed
      }
      return null
    } catch (err) {
      console.log(err)
      return null
    }
  }

  getKey () {
    return this.password
  }

  getCurrentSeed () {
    const account = this.getCurrentAccount()
    const key = this.getKey()
    const seed = Utils.aes256decrypt(account.seed, key)
    return seed
  }

  // return the account with current = true and the reletated network
  setCurrentNetwork (network) {
    try {
      const options = JSON.parse(localStorage.getItem('options'))
      options.selectedNetwork = network
      localStorage.setItem('options', JSON.stringify(options))

      // change pagehook
      this.emit('setProvider', network.provider)
      this.emit('setNetwork', network)
      this.customizatorService.setProvider(network.provider)

      // handle the init phase ( yes network no account )
      const account = this.getCurrentAccount()
      if (account) {
        this.emit('setAccount', account)
      }

      return
    } catch (err) {
      console.log(err)
      throw new Error(err)
    }
  }

  getCurrentNetwork () {
    try {
      const options = JSON.parse(localStorage.getItem('options'))
      if (!options) {
        localStorage.setItem('options', JSON.stringify({}))
        return {}
      }
      return options.selectedNetwork
    } catch (err) {
      throw new Error(err)
    }
  }

  getAllNetworks () {
    try {
      const options = JSON.parse(localStorage.getItem('options'))
      if (!options) {
        localStorage.setItem('options', JSON.stringify({}))
        return {}
      }
      return options.networks
    } catch (err) {
      throw new Error(err)
    }
  }

  addNetwork (network) {
    // TODO check that the name does not exists

    try {
      let options = JSON.parse(localStorage.getItem('options'))
      if (!options.networks)
        options.networks = []

      options.networks.push(network)
      localStorage.setItem('options', JSON.stringify(options))

      this.emit('setNetworks', options.networks)
      return
    } catch (err) {
      console.log(err)
      throw new Error(err)
    }
  }

  deleteCurrentNetwork () {
    try {
      let options = JSON.parse(localStorage.getItem('options'))
      const currentNetwork = options.selectedNetwork

      const networks = options.networks.filter(network => currentNetwork.name !== network.name)
      options.networks = networks

      // set the first network with the same type (mainnet/testnet)
      const selectedNetwork = options.networks[0]
      options.selectedNetwork = selectedNetwork

      localStorage.setItem('options', JSON.stringify(options))

      this.emit('setNetworks', options.networks)
      this.emit('setNetwork', selectedNetwork)
      this.emit('setProvider', selectedNetwork.provider)

      return currentNetwork
    } catch (err) {
      console.log(err)
      throw new Error(err)
    }
  }

  isAccountNameAlreadyExists ({ name }) {
    const data = this.storageDataService.getData()
    const alreadyExists = data.filter(account => account.name === name)
    if (alreadyExists.length > 0) {
      return true
    } else {
      return false
    }
  }

  addAccount ({ account, network, isCurrent }) {

    if (isCurrent) {
      const data = this.storageDataService.getData()
      data.forEach(account => { account.current = false })
      this.storageDataService.setData(data)
    }

    const key = this.getKey()
    const eseed = Utils.aes256encrypt(account.seed, key)

    const obj = {
      name: account.name,
      seed: eseed,
      transactions: [],
      data: account.data,
      current: Boolean(isCurrent),
      id: Utils.sha256(account.name)
    }

    try {
      const data = this.storageDataService.getData()

      const alreadyExists = data.filter(account => account.id === obj.id)
      if (alreadyExists.length > 0) {
        return null
      }

      data.push(obj)
      this.storageDataService.setData(data)

      this.emit('setProvider', network.provider)
      this.emit('setAddress', account.data.latestAddress)
      this.emit('setAccount', obj)

      return obj
    } catch (err) {
      throw new Error(err)
    }
  }

  getCurrentAccount () {
    try {
      // check the user has already logged in
      if (!this.storageDataService)
        return null

      const accounts = this.storageDataService.getData()
      const state = this.getState()
      if (accounts.length === 0 && state === APP_STATE.WALLET_NOT_INITIALIZED)
        return null

      for (let account of accounts) {
        if (account.current)
          return account
      }

    } catch (err) {
      throw new Error(err)
    }
  }

  setCurrentAccount ({ currentAccount }) {
    let data = this.storageDataService.getData()
    data.forEach(account => { account.current = false })
    this.storageDataService.setData(data)

    try {
      const data = this.storageDataService.getData()
      data.forEach(account => {
        if (account.id === currentAccount.id) {
          account.current = true
          const network = this.getCurrentNetwork()
          this.emit('setProvider', network.provider)
          this.emit('setNetwork', network)
          this.emit('setAddress', account.data.latestAddress)
          this.emit('setAccount', account)
        }
      })
      this.storageDataService.setData(data)
    } catch (err) {
      console.log(err)
      throw new Error(err)
    }
  }

  resetData () {
    try {
      this.storageDataService.setData([])
      return
    } catch (err) {
      console.log(err)
      throw new Error(err)
    }
  }

  updateDataAccount ({ updatedData }) {
    try {
      const data = this.storageDataService.getData()
      let updatedAccount = {}
      data.forEach(account => {
        if (account.current) {
          account.data = updatedData
          updatedAccount = account
        }
      })
      this.storageDataService.setData(data)
      return updatedAccount
    } catch (err) {
      throw new Error(err)
    }
  }

  updateNetworkAccount ({ network }) {
    try {
      const data = this.storageDataService.getData()
      let updatedAccount = {}
      data.forEach(account => {
        if (account.current) {
          account.network = network
          updatedAccount = account
        }
      })
      this.storageDataService.setData(data)
      return updatedAccount
    } catch (err) {
      throw new Error(err)
    }
  }

  updateTransactionsAccount ({ transactions }) {
    try {
      const data = this.storageDataService.getData()
      let updatedAccount = {}
      data.forEach(account => {
        if (account.current) {
          account.transactions = transactions
          updatedAccount = account
        }
      })
      this.storageDataService.setData(data)
      return updatedAccount
    } catch (err) {
      throw new Error(err)
    }
  }

  updateNameAccount ({ current, newName }) {
    try {
      const data = this.storageDataService.getData()
      let updatedAccount = {}
      data.forEach(account => {
        if (account.id === current.id) {
          account.name = newName
          account.id = Utils.sha256(newName)
          updatedAccount = account
        }
      })
      this.storageDataService.setData(data)
      this.emit('setAccount', updatedAccount)
    } catch (err) {
      throw new Error(err)
    }
  }

  deleteAccount ({ account }) {
    try {
      const data = this.storageDataService.getData()
      if (data.length === 1) { return null } else {
        // remove account
        const app = data.filter(acc => acc.id !== account.id)

        // reset the current status
        app.forEach(account => { account.current = false })

        // set the new current account (the first one of this network)
        app[0].current = true
        this.storageDataService.setData(app)
        this.emit('setAccount', app[0])
        return app[0]
      }
    } catch (err) {
      throw new Error(err)
    }
  }

  getAllAccounts () {
    const accounts = []
    try {
      this.storageDataService.getData().forEach(account => {
        accounts.push(account)
      })
      return accounts
    } catch (err) {
      throw new Error(err)
    }
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

  startSession () {
    try {
      const date = new Date()
      localStorage.setItem('session', date.getTime())
      this.setState(APP_STATE.WALLET_UNLOCKED)
      return true
    } catch (err) {
      console.log(err)
      return false
    }
  }

  checkSession () {
    try {
      const currentState = this.getState()

      // payment queue not empty during an extension hard reload cause show confirm view with 0 payment since the payments are deleted during the hard rel
      if (currentState === APP_STATE.WALLET_TRANSFERS_IN_QUEUE && this.getPayments().length === 0 && !this.password) {
        this.setState(APP_STATE.WALLET_UNLOCKED)
        return
      }

      if (currentState === APP_STATE.WALLET_TRANSFERS_IN_QUEUE)
        return

      if (!this.password && !this.isWalletSetup()) {
        this.setState(APP_STATE.WALLET_NOT_INITIALIZED)
        return
      }

      if (!this.password) {
        this.setState(APP_STATE.WALLET_LOCKED)
        return
      }

      const time = localStorage.getItem('session')
      if (time) {
        const date = new Date()
        const currentTime = date.getTime()
        if (currentTime - time > 900000) { // greather than 15 minutes
          this.storageDataService.writeDataToStorage()
          this.setState(APP_STATE.WALLET_LOCKED)
          return
        }
        this.setState(APP_STATE.WALLET_UNLOCKED)
        return
      } else { this.password = false }

      if (currentState <= APP_STATE.WALLET_INITIALIZED) {
        return
      } else {
        this.setState(APP_STATE.WALLET_LOCKED)
        return
      }
    } catch (err) {
      console.log(err)
      return false
    }
  }

  deleteSession () {
    try {
      this.storageDataService.writeDataToStorage()
      localStorage.removeItem('session')
      this.setState(APP_STATE.WALLET_LOCKED)
      this.password = false

      //injection
      this.emit('setAddress', null)
      return true
    } catch (err) {
      console.log(err)
      return false
    }
  }

  async openPopup () {
    if (this.popup && this.popup.closed)
      this.popup = false

    if (this.popup && await this.updateWindow())
      return

    if (typeof chrome !== 'undefined') {
      return extensionizer.windows.create({
        url: 'packages/popup/build/index.html',
        type: 'popup',
        width: 380,
        height: 600,
        left: 25,
        top: 25
      }, window => {
        this.popup = window
      })
    }

    this.popup = await extensionizer.windows.create({
      url: 'packages/popup/build/index.html',
      type: 'popup',
      width: 380,
      height: 600,
      left: 25,
      top: 25
    })
  }

  async closePopup () {
    /* if(this.payments.length)
        return; */

    if (!this.popup)
      return

    extensionizer.windows.remove(this.popup.id)
    this.popup = false
  }

  async updateWindow () {
    return new Promise(resolve => {
      if (typeof chrome !== 'undefined') {
        return extensionizer.windows.update(this.popup.id, { focused: true }, window => {
          resolve(Boolean(window))
        })
      }

      extensionizer.windows.update(this.popup.id, {
        focused: true
      }).then(resolve).catch(() => resolve(false))
    })
  }

  setState (state) {
    try {
      localStorage.setItem('state', state)
    } catch (err) {
      console.log(err)
    }
  }

  getState () {
    const state = parseInt(localStorage.getItem('state'))
    return state
  }

  pushPayment (payment, uuid, callback) {
    const currentState = this.getState()
    console.log(currentState)
    if (currentState !== APP_STATE.WALLET_LOCKED)
      this.setState(APP_STATE.WALLET_TRANSFERS_IN_QUEUE)
    else
      console.log('locked')

    const obj = {
      payment,
      uuid,
      callback
    }

    this.payments.push(obj)
    console.log(this.payments)
    this.popup = null
    if (!this.popup && !payment.isPopup)
      this.openPopup()

    if (currentState !== APP_STATE.WALLET_LOCKED)
      BackgroundAPI.setPayments(this.payments)

    return
  }

  confirmPayment (obj) {
    BackgroundAPI.setConfirmationLoading(true)

    let transfers = obj.payment.args[0]
    const network = this.getCurrentNetwork()
    const iota = composeAPI({ provider: network.provider })
    const cc = this.payments.filter(obj => obj.uuid === obj.uuid)[0].callback

    const key = this.getKey()
    const account = this.getCurrentAccount()
    const seed = Utils.aes256decrypt(account.seed, key)

    const depth = 3
    const minWeightMagnitude = network.difficulty

    // convert message and tag from char to trits
    transfers.forEach(transfer => {
      transfer.value = parseInt(transfer.value)
      transfer.tag = asciiToTrytes(JSON.stringify(transfer.tag))
      transfer.message = asciiToTrytes(JSON.stringify(transfer.message))
    })

    try {
      iota.prepareTransfers(seed, transfers)
        .then(trytes => {
          return iota.sendTrytes(trytes, depth, minWeightMagnitude)
        })
        .then(async bundle => {
          this.removePayment(obj)
          BackgroundAPI.setPayments(this.payments)
          this.setState(APP_STATE.WALLET_UNLOCKED)

          cc({ data: bundle, success: true, uuid: obj.uuid })

          // since every transaction is generated a new address, it's necessary to modify the hook
          const data = await iota.getAccountData(seed)
          BackgroundAPI.setAddress(data.latestAddress)

          // comunicates to the popup the new app State
          BackgroundAPI.setAppState(APP_STATE.WALLET_UNLOCKED)

          BackgroundAPI.setConfirmationLoading(false)
        })
        .catch(err => {
          BackgroundAPI.setConfirmationError(err.message)
          BackgroundAPI.setConfirmationLoading(false)
          cc({ data: err.message, success: false, uuid: obj.uuid })
        })
    } catch (err) {
      BackgroundAPI.setConfirmationError(err.message)
      BackgroundAPI.setConfirmationLoading(false)
      cc({ data: err.message, success: false, uuid: obj.uuid })
    }
    return
  }

  removePayment (paymentToRemove) {
    this.payments = this.payments.filter(payment => payment.uuid !== paymentToRemove.uuid)
    if (this.payments.length === 0) {
      this.setState(APP_STATE.WALLET_UNLOCKED)
      this.closePopup()
    }
  }

  getPayments () {
    // remove callback
    const payments = this.payments.map(obj => { return { payment: obj.payment, uuid: obj.uuid } })
    return payments
  }

  rejectAllPayments () {
    this.payments = []
    this.closePopup()
    this.setState(APP_STATE.WALLET_UNLOCKED)
  }

  rejectPayment (rejectedPayment) {
    const cc = this.payments.filter(obj => rejectedPayment.uuid === obj.uuid)[0].callback
    this.payments = this.payments.filter(payment => payment.uuid !== rejectedPayment.uuid)

    if (cc) {
      cc({
        data: 'Transaction has been rejected',
        success: false,
        uuid: rejectedPayment.uuid
      })
    }

    if (this.payments.length === 0) {
      this.setState(APP_STATE.WALLET_UNLOCKED)
      this.closePopup()
    }
  }

  // Account Data Handling
  async loadAccountData () {
    const seed = this.getCurrentSeed()
    const network = this.getCurrentNetwork()
    let account = this.getCurrentAccount()
    const { transactions, newData } = await AccountDataService.retrieveAccountData(seed, network)

    //show notification
    const transactionsJustConfirmed = this._getTransactionsJustConfirmed(account, transactions)
    transactionsJustConfirmed.forEach(transaction => {
      this.notificationsService.showNotification(
        'Transaction Confirmed',
        transaction.bundle,
        network.link + 'bundle/' + transaction.bundle
      )
    })
    
    account = this._updateAccountTransactionsPersistence(account, transactions)
    const newTransactions = this._getNewTransactionsFromAll(account, transactions)

    const updatedData = Object.assign({}, newData, {
      transactions: [...newTransactions, ...account.transactions]
    })
    // store txs in the localstorage
    this.updateTransactionsAccount({ 
      transactions: [...newTransactions, ...account.transactions],
      network
    })

    const updatedAccount = this.updateDataAccount({ updatedData, network })
    this.emit('setAccount', updatedAccount)
  }

  startHandleAccountData () {
    // first time without loading from the iotajs since are store in the localstorage
    const account = this.getCurrentAccount()
    this.emit('setAccount', account)

    if (this.accountDataHandler)
      return

    this.accountDataHandler = setInterval(() => this.loadAccountData(), 90000)
  }

  stopHandleAccountData () {
    clearInterval(this.accountDataHandler)
  }

  async reloadAccountData () {
    this.emit('setAccount', {})
    clearInterval(this.accountDataHandler)
    this.loadAccountData()
    this.accountDataHandler = setInterval(() => this.loadAccountData(), 90000)
  }

  // CUSTOM iotajs functions
  // if wallet is locked user must login, after having do it, wallet will execute every request put in the queue
  pushRequest (method, { uuid, resolve, data }) {
    const seedNeeded = ['getAccountData', 'getInputs', 'getNewAddress', 'generateAddress']
    if (seedNeeded.includes(method)) {
      const state = this.getState()
      if (state <= APP_STATE.WALLET_LOCKED) {
        if (!this.popup)
          this.openPopup()

        const request = {
          method,
          options: {
            uuid,
            resolve,
            data
          }
        }
        this.requests.push(request)
      } else {
        const seed = this.getCurrentSeed()
        this.customizatorService.request(method, { uuid, resolve, seed, data })
      }
    } else {
      this.customizatorService.request(method, { uuid, resolve, data })
    }
  }

  executeRequests () {
    this.requests.forEach(request => {
      const method = request.method
      const uuid = request.options.uuid
      const resolve = request.options.resolve
      const data = request.options.data
      const seed = this.getCurrentSeed()

      this.customizatorService.request(method, { uuid, resolve, seed, data })
    })
  }

  startFetchMam (options) {
    const network = this.getCurrentNetwork()
    MamService.fetch(network.provider, options.root, options.mode, options.sideKey, data => {
      BackgroundAPI.newMamData(data)
    })
  }

  _updateAccountTransactionsPersistence(account, transactions) {
    for (let tx of transactions) {
      for (let tx2 of account.transactions) {
        if (
          tx.bundle === tx2.bundle &&
          tx.status !== tx2.status
        ) {
          tx2.status = tx.status
        }
      }
    }
    return account
  }

  _getTransactionsJustConfirmed(account, transactions) {
    const transactionsJustConfirmed = []
    for (let tx of transactions) {
      for (let tx2 of account.transactions) {
        if (
          tx.bundle === tx2.bundle &&
          tx.status !== tx2.status &&
          tx.status === true
        ) {
          transactionsJustConfirmed.push(tx)
        }
      }
    }
    return transactionsJustConfirmed
  }

  _getNewTransactionsFromAll (account, transactions) {
    const newTxs = []
    for (let txToCheck of transactions) {
      let isNew = true
      for (let tx of account.transactions ) {
        if (tx.bundle === txToCheck.bundle) {
          isNew = false
        }
      }
      if (isNew) {
        newTxs.push(txToCheck)
      }
    }
    return newTxs
  }
}

export default Wallet
