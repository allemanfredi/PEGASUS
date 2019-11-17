
import EventEmitter from 'eventemitter3'
import extensionizer from 'extensionizer'
import Utils from '@pegasus/utils/utils'
import { backgroundMessanger } from '@pegasus/utils/messangers'
import { APP_STATE } from '@pegasus/utils/states'
import { composeAPI } from '@iota/core'
import { asciiToTrytes } from '@iota/converter'
import settings from '@pegasus/utils/options'
import AccountDataController from './controllers/account-data-controller'
import CustomizatorController from './controllers/customizator-controller'
import MamController from './controllers/mam-controller'
import StorageController from './controllers/storage-controller'
import NotificationsController from './controllers/notifications-controller'
import ConnectorController from './controllers/connector-controller'
import NetworkController from './controllers/network-controller'
import walletController from './controllers/wallet-controller'
import SessionsController from './controllers/session-controller'

const SESSION_TIME = 30000
const ACCOUNT_RELOAD_TIME = 90000

class PegasusEngine extends EventEmitter {
  constructor () {
    super()

    this.popup = false
    this.transfers = []
    this.requests = []
    this.accountDataHandler = false,

    this.customizatorController = new CustomizatorController()
    this.notificationsController = new NotificationsController()
    this.connectorController = new ConnectorController()
    this.storageController = new StorageController()

    this.networkController = new NetworkController({
      storageController: this.storageController,
      customizatorController: this.customizatorController
    })

    this.walletController = new walletController({
      storageController: this.storageController,
      networkController: this.networkController
    })

    this.accountDataController = new AccountDataController({
      networkController: this.networkController,
      walletController: this.walletController,
      notificationsController: this.notificationsController
    })

    this.sessionController = new SessionsController({
      storageController: this.storageController,
      walletController: this.walletController,
      engine: this
    })    

    if (!this.walletController.isWalletSetup()) {
      this.walletController.setupWallet()
    }

    const currentNetwork = this.networkController.getCurrentNetwork()
    if (Object.entries(currentNetwork).length === 0 && currentNetwork.constructor === Object) {
      
      settings.networks.forEach(network => this.networkController.addNetwork(network))
      this.customizatorController.setProvider(settings.networks[0].provider)
      this.networkController.setCurrentNetwork(settings.networks[0])
    } else {
      this.customizatorController.setProvider(currentNetwork.provider)
    }

    this.customizatorController.setWalletController(this)

    this.sessionController.checkSession()
    setInterval(() => this.sessionController.checkSession(), SESSION_TIME)
  }

  // WALLET BACKGROUND API
  isWalletSetup () {
    return this.walletController.isWalletSetup()
  }

  setupWallet () {
    this.walletController.setupWallet()
  }

  setStorageKey(key) {
    this.storageController.setEncryptionKey(key)
    this.connectorController.setStorageController(this.storageController)
  }

  writeOnLocalStorage() {
    if (this.storageController) {
      this.storageController.writeToStorage()
    }
  }

  unlockWallet (psw) {
    this.walletController.unlockWallet(psw)
  }

  restoreWallet ({ account, network, key }) {
    return this.walletController.restoreWallet(account, network, key)
  }

  unlockSeed (psw) {
    return this.walletController.unlockSeed(psw)
  }

  storePassword (psw) {
    this.walletController.storePassword(psw)
  }

  setPassword (psw) {
    this.walletController.setPassword(psw)
  }

  comparePassword (psw) {
    return this.walletController.comparePassword(psw)
  }

  setCurrentNetwork (network) {
    this.networkController.setCurrentNetwork(network)
    const account = this.getCurrentAccount()
    if (account) {
      this.emit('setAccount', account)
    }
  }

  getCurrentNetwork () {
    return this.networkController.getCurrentNetwork()
  }

  getAllNetworks () {
    return this.networkController.getAllNetworks()
  }

  addNetwork (network) {
    this.networkController.addNetwork(network)
  }

  deleteCurrentNetwork () {
    this.networkController.deleteCurrentNetwork()
  }

  async addAccount ({ name, isCurrent }) {
    return this.walletController.addAccount(name, isCurrent)
  }

  isAccountNameAlreadyExists ({ name }) {
    return this.walletController.isAccountNameAlreadyExists(name)
  }

  getCurrentAccount () {
    return this.walletController.getCurrentAccount()
  }

  getAllAccounts () {
    return this.walletController.getAllAccounts()
  }

  setCurrentAccount ({ currentAccount }) {
    this.walletController.setCurrentAccount(currentAccount)
  }

  updateNameAccount ({ current, newName }) {
    this.walletController(current, newName)
  }

  deleteAccount ({ account }) {
    return this.walletController.deleteAccount(account)
  }

  resetData () {
    this.walletController.resetData()
  }

  generateSeed (length = 81) {
    return this.walletController.generateSeed(length)
  }

  isSeedValid (seed) {
    return this.walletController.isSeedValid()
  }

  startSession () {
    this.sessionController.startSession()
  }

  checkSession () {
   this.sessionController.checkSession()
  }

  deleteSession () {
    this.sessionController.deleteSession()
  }

  getState () {
    return this.walletController.getState()
  }

  setState (state) {
    this.walletController.setState(state)
  }



  //END API


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
        height: 620,
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
      height: 620,
      left: 25,
      top: 25
    })
  }

  async closePopup () {
    /* if(this.transfers.length)
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

  

  pushTransfer (transfer, uuid, resolve, website) {
    const currentState = this.getState()
    if (currentState > APP_STATE.WALLET_LOCKED)
      this.walletController.setState(APP_STATE.WALLET_TRANSFERS_IN_QUEUE)
    else
      console.log('locked')
    
    //check permissions
    if (!transfer.isPopup) {
      const connection = this.connectorController.getConnection(website.origin)
      if (!connection) {
        this.walletController.setState(APP_STATE.WALLET_REQUEST_PERMISSION_OF_CONNECTION)
        this.connectorController.setConnectionToStore({
          website,
          requestToConnect: true,
          connected: false,
          enabled: false
        })
      }
      else if (!connection.enabled) {
        this.walletController.setState(APP_STATE.WALLET_REQUEST_PERMISSION_OF_CONNECTION)
      }
    }

    const obj = {
      transfer,
      uuid,
      resolve
    }

    this.transfers.push(obj)
    this.popup = null
    if (!this.popup && !transfer.isPopup)
      this.openPopup()

    if (currentState > APP_STATE.WALLET_LOCKED)
      backgroundMessanger.setTransfers(this.transfers)

    return
  }

  pushTransferFromPopup (transfer, resolve) {
    const currentState = this.getState()
    if (currentState > APP_STATE.WALLET_LOCKED)
      this.walletController.setState(APP_STATE.WALLET_TRANSFERS_IN_QUEUE)
    else
      console.log('locked')

    const obj = {
      transfer,
      uuid: transfer.uuid,
      resolve
    }

    this.transfers.push(obj)
    if (currentState > APP_STATE.WALLET_LOCKED)
      backgroundMessanger.setTransfers(this.transfers)
    return
  }

  confirmTransfer (obj) {
    backgroundMessanger.setConfirmationLoading(true)

    let transfers = obj.transfer.args[0]
    const network = this.networkController.getCurrentNetwork()
    const iota = composeAPI({ provider: network.provider })
    const resolve = this.transfers.filter(obj => obj.uuid === obj.uuid)[0].resolve

    const key = this.walletController.getKey()
    const account = this.walletController.getCurrentAccount()
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
          this.removeTransfer(obj)
          backgroundMessanger.setTransfers(this.transfers)
          this.walletController.setState(APP_STATE.WALLET_UNLOCKED)

          resolve({ data: bundle, success: true, uuid: obj.uuid })

          // since every transaction is generated a new address, it's necessary to modify the hook
          const data = await iota.getAccountData(seed)
          backgroundMessanger.setAddress(data.latestAddress)

          // comunicates to the popup the new app State
          backgroundMessanger.setAppState(APP_STATE.WALLET_UNLOCKED)

          backgroundMessanger.setConfirmationLoading(false)
        })
        .catch(err => {
          backgroundMessanger.setConfirmationError(err.message)
          backgroundMessanger.setConfirmationLoading(false)
          resolve({ data: err.message, success: false, uuid: obj.uuid })
        })
    } catch (err) {
      console.log(err)
      backgroundMessanger.setConfirmationError(err.message)
      backgroundMessanger.setConfirmationLoading(false)
      resolve({ data: err.message, success: false, uuid: obj.uuid })
    }
    return
  }

  removeTransfer (transferToRemove) {
    this.transfers = this.transfers.filter(transfer => transfer.uuid !== transferToRemove.uuid)
    if (this.transfers.length === 0) {
      this.walletController.setState(APP_STATE.WALLET_UNLOCKED)
      this.closePopup()
    }
  }

  getTransfers () {
    // remove callback
    const transfers = this.transfers.map(obj => { return { transfer: obj.transfer, uuid: obj.uuid } })
    return transfers
  }

  getRequests () {
    return this.requests
  }

  rejectAllTransfers () {
    this.transfers.filter(p => {
      p.resolve({
        data: 'Transaction has been rejected',
        success: false,
        uuid: p.uuid
      })
    })
    this.transfers = []
    this.closePopup()
    this.walletController.setState(APP_STATE.WALLET_UNLOCKED)
  }

  rejectTransfer (rejectedTransfer) {
    const resolve = this.transfers.filter(obj => rejectedTransfer.uuid === obj.uuid)[0].resolve
    this.transfers = this.transfers.filter(transfer => transfer.uuid !== rejectedTransfer.uuid)

    if (resolve) {
      resolve({
        data: 'Transaction has been rejected',
        success: false,
        uuid: rejectedTransfer.uuid
      })
    }

    if (this.transfers.length === 0) {
      this.walletController.setState(APP_STATE.WALLET_UNLOCKED)
      this.closePopup()
    }
  }

  loadAccountData () {
    this.accountDataController.loadAccountData()
  }

  startHandleAccountData () {
    const account = this.walletController.getCurrentAccount()
    this.emit('setAccount', account)

    if (this.accountDataHandler) {
      return
    }

    this.accountDataHandler = setInterval(() => this.accountDataController.loadAccountData(), ACCOUNT_RELOAD_TIME)
  }

  stopHandleAccountData () {
    clearInterval(this.accountDataHandler)
  }

  async reloadAccountData () {
    clearInterval(this.accountDataHandler)
    this.accountDataController.loadAccountData()
    this.accountDataHandler = setInterval(() => this.accountDataController.loadAccountData(), ACCOUNT_RELOAD_TIME)
  }

  // CUSTOM iotajs functions
  // if wallet is locked user must login, after having do it, wallet will execute 
  //every request put in the queue IF USER  GRANTed PERMISSIONS
  pushRequest (method, { uuid, resolve, data, website }) {
    const connection = this.connectorController.getConnection(website.origin)
    let mockConnection = connection
    let isPopupAlreadyOpened = false

    if (!connection) {
      this.walletController.setState(APP_STATE.WALLET_REQUEST_PERMISSION_OF_CONNECTION)
      this.openPopup()
      mockConnection = {
        website,
        requestToConnect: true,
        connected: false,
        enabled: false
      }
      this.connectorController.setConnectionToStore(connection)
      isPopupAlreadyOpened = true
    } else if (!connection.enabled) {
      this.walletController.setState(APP_STATE.WALLET_REQUEST_PERMISSION_OF_CONNECTION)
      if (!this.popup)
        this.openPopup()
      isPopupAlreadyOpened = true
    }

    const state = this.getState()
    if (state <= APP_STATE.WALLET_LOCKED || !connection  || !connection.enabled) {
      if (!this.popup && isPopupAlreadyOpened === false){
        this.openPopup()
      }

      const request = {
        connection: mockConnection,
        method,
        uuid,
        resolve,
        data
      }
      this.requests.push(request)
    } else if (connection.enabled) {
      this.customizatorController.request(method, { uuid, resolve, data })
    } 
  }

  executeRequests () {
    this.requests.forEach(request => {
      const method = request.method
      const uuid = request.uuid
      const resolve = request.resolve
      if (request.connection.enabled) {
        const data = request.data
        const seed = this.walletController.getCurrentSeed()
        this.customizatorController.request(method, { uuid, resolve, seed, data })
      } else {
        resolve({ data: 'no permissions', success: false, uuid })
      }
    })
    this.requests = []
  }

  rejectRequests() {
    this.requests.forEach(r => {
      r.resolve({
        data: 'Request has been rejected by the user',
        success: false,
        uuid: r.uuid
      })
    })
    this.requests = []
    this.closePopup()
  }

  connect(uuid, resolve, website) {
    this.openPopup()
    this.connectorController.connect(uuid, resolve, website)
  }

  getConnection(origin) {
    const connection = this.connectorController.getConnection(origin)
    return connection
  }

  pushConnection(connection) {
    this.connectorController.pushConnection(connection)
  }

  updateConnection(connection) {
    this.connectorController.updateConnection(connection)
  }

  completeConnection() { 
    const requests = this.connectorController.completeConnection(this.requests)
    this.requests = requests
  }

  rejectConnection(){
    const requests = this.connectorController.rejectConnection(this.requests)
    this.requests = requests
    this.closePopup()
  }

  setWebsite(website) {
    this.connectorController.setCurrentWebsite(website)
  }

  getWebsite() {
    const website = this.connectorController.getCurrentWebsite()
    return website
  }

  startFetchMam (options) {
    const network = this.networkController.getCurrentNetwork()
    MamController.fetch(network.provider, options.root, options.mode, options.sideKey, data => {
      backgroundMessanger.newMamData(data)
    })
  }
}

export default PegasusEngine