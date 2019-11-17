import Duplex from '@pegasus/utils/duplex'
import { backgroundMessanger } from '@pegasus/utils/messangers'
import { APP_STATE } from '@pegasus/utils/states'
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
import PopupController from './controllers/popup-controller'
import TransferController from './controllers/transfer-controller'

const SESSION_TIME = 30000
const ACCOUNT_RELOAD_TIME = 90000

class PegasusEngine {
  constructor () {

    this.requests = []
    this.accountDataHandler = false

    const duplex = new Duplex.Host()
    backgroundMessanger.init(duplex)

    this.popupController = new PopupController()
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

    this.transferController = new TransferController({
      connectorController: this.connectorController,
      walletController: this.walletController,
      popupController: this.popupController,
      networkController: this.networkController
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
      backgroundMessanger.setAccount(account)
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

  pushTransfer (transfer, uuid, resolve, website) {
    this.transferController.pushTransfer(transfer, uuid, resolve, website)
  }

  pushTransferFromPopup (transfer) {
    this.transferController.pushTransferFromPopup(transfer)
  }

  confirmTransfer (transfer) {
    this.transferController.confirmTransfer(transfer)
  }

  removeTransfer (transfer) {
    this.transferController.removeTransfer(transfer)
  }

  getTransfers () {
    return this.transferController.getTransfers()
  }

  rejectAllTransfers () {
    this.transferController.rejectAllTransfers()
  }

  rejectTransfer (transfer) {
    this.transferController.rejectTransfer(transfer)
  }

  openPopup () {
    this.popupController.openPopup()
  }

  closePopup () {
    this.popupController.closePopup()
  }
  //END API


  getRequests () {
    return this.requests
  }

  loadAccountData () {
    this.accountDataController.loadAccountData()
  }

  startHandleAccountData () {
    const account = this.walletController.getCurrentAccount()
    backgroundMessanger.setAccount(account)

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
    this.popupController.openPopup()
    this.connectorController.connect(uuid, resolve, website)
  }

  getConnection(origin) {
    return this.connectorController.getConnection(origin)
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
    this.popupController.closePopup()
  }

  setWebsite(website) {
    this.connectorController.setCurrentWebsite(website)
  }

  getWebsite() {
    return this.connectorController.getCurrentWebsite()
  }

  startFetchMam (options) {
    const network = this.networkController.getCurrentNetwork()
    MamController.fetch(network.provider, options.root, options.mode, options.sideKey, data => {
      backgroundMessanger.newMamData(data)
    })
  }
}

export default PegasusEngine