import Duplex from '@pegasus/utils/duplex'
import { backgroundMessanger } from '@pegasus/utils/messangers'
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

    /* C O N T R O L L E R S */
    this.popupController = new PopupController()
    this.connectorController = new ConnectorController()
    this.storageController = new StorageController()
    this.notificationsController = new NotificationsController()

    this.customizatorController = new CustomizatorController({
      popupController: this.popupController,
      connectorController: this.connectorController,
      walletController: null //DEFINED BELOW
    })

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

    this.mamController = new MamController()

    this.customizatorController.setWalletController(
      this.walletController
    )
    /* E N D   C O N T R O L L E R S */

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

  pushRequest (method, { uuid, resolve, data, website }) {
    this.customizatorController.pushRequest(
      method,
      uuid,
      resolve,
      data,
      website
    )
  }

  getRequests () {
    return this.customizatorController.getRequests()
  }

  executeRequests () {
    this.customizatorController.executeRequests()
  }

  rejectRequests() {
    this.customizatorController.rejectRequests()
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
    let requests = this.customizatorController.getRequests()
    requests = this.connectorController.completeConnection(requests)
    this.customizatorController.setRequests(requests)
  }

  rejectConnection(){
    let requests = this.customizatorController.getRequests()
    requests = this.connectorController.rejectConnection(requests)
    this.customizatorController.setRequests(requests)
    this.popupController.closePopup()
  }

  setWebsite(website) {
    this.connectorController.setCurrentWebsite(website)
  }

  getWebsite() {
    return this.connectorController.getCurrentWebsite()
  }
  //END API

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
  

  startFetchMam (options) {
    const network = this.networkController.getCurrentNetwork()
    this.mamController.fetch(network.provider, options.root, options.mode, options.sideKey, data => {
      backgroundMessanger.newMamData(data)
    })
  }
}

export default PegasusEngine