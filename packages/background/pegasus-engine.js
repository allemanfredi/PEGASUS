import Duplex from '@pegasus/utils/duplex'
import { backgroundMessanger } from '@pegasus/utils/messangers'
import settings from '@pegasus/utils/options'
import AccountDataController from './controllers/account-data-controller'
import CustomizatorController from './controllers/customizator-controller'
import MamController from './controllers/mam-controller'
import StateStorageController from './controllers/state-storage-controller'
import NotificationsController from './controllers/notifications-controller'
import ConnectorController from './controllers/connector-controller'
import NetworkController from './controllers/network-controller'
import walletController from './controllers/wallet-controller'
import SessionsController from './controllers/session-controller'
import PopupController from './controllers/popup-controller'
import TransferController from './controllers/transfer-controller'
import SeedVaultController from './controllers/seed-vault-controller'
import { APP_STATE } from '@pegasus/utils/states'

const SESSION_TIME = 30000

class PegasusEngine {
  constructor() {
    this.requests = []
    this.accountDataHandler = false
    this.transactionsAutoPromotionHandler = false

    const duplex = new Duplex.Host()
    backgroundMessanger.init(duplex)

    /* C O N T R O L L E R S */
    this.popupController = new PopupController()
    this.stateStorageController = new StateStorageController()
    this.notificationsController = new NotificationsController()

    this.connectorController = new ConnectorController({
      popupController: this.popupController
    })

    this.mamController = new MamController({
      stateStorageController: this.stateStorageController
    })

    this.customizatorController = new CustomizatorController({
      popupController: this.popupController,
      connectorController: this.connectorController,
      walletController: null, //DEFINED BELOW
      networkController: null, //DEFINED BELOW
      mamController: this.mamController
    })

    this.networkController = new NetworkController({
      stateStorageController: this.stateStorageController,
      customizatorController: this.customizatorController
    })

    this.walletController = new walletController({
      stateStorageController: this.stateStorageController,
      networkController: this.networkController,
      connectorController: this.connectorController
    })

    this.accountDataController = new AccountDataController({
      networkController: this.networkController,
      walletController: this.walletController,
      notificationsController: this.notificationsController
    })

    this.sessionController = new SessionsController({
      walletController: this.walletController,
      stateStorageController: this.stateStorageController,
      customizatorController: this.customizatorController
    })

    this.transferController = new TransferController({
      connectorController: this.connectorController,
      walletController: this.walletController,
      popupController: this.popupController,
      networkController: this.networkController
    })

    this.seedVaultController = new SeedVaultController({
      walletController: this.walletController
    })

    this.customizatorController.setWalletController(this.walletController)
    this.customizatorController.setNetworkController(this.networkController)
    this.customizatorController.setTransferController(this.transferController)
    this.mamController.setNetworkController(this.networkController)
    this.mamController.setWalletController(this.walletController)
    this.connectorController.setWalletController(this.walletController)
    this.walletController.setAccountDataController(this.accountDataController)
    this.connectorController.setNetworkController(this.networkController)
    this.networkController.setWalletController(this.walletController)
    this.walletController.setSessionController(this.sessionController)
    /* E N D   C O N T R O L L E R S */

    if (!this.walletController.isWalletSetup()) {
      this.walletController.setState(APP_STATE.WALLET_NOT_INITIALIZED)
    }

    const currentNetwork = this.networkController.getCurrentNetwork()
    if (!currentNetwork) {
      this.networkController.setCurrentNetwork(settings.networks[0])
    }

    this.sessionController.checkSession()
    setInterval(() => this.sessionController.checkSession(), SESSION_TIME)

    const popupSettings = this.getPopupSettings()
    if (popupSettings.autoPromotion.enabled)
      this.enableTransactionsAutoPromotion(
        parseInt(popupSettings.autoPromotion.time * 1000 * 60)
      )
  }

  // WALLET BACKGROUND API
  isWalletSetup() {
    return this.walletController.isWalletSetup()
  }

  unlockWallet(psw) {
    return this.walletController.unlockWallet(psw)
  }

  restoreWallet({ account, password }) {
    return this.walletController.restoreWallet(account, password)
  }

  unlockSeed(psw) {
    return this.walletController.unlockSeed(psw)
  }

  initWallet(psw) {
    return this.walletController.initWallet(psw)
  }

  comparePassword(psw) {
    return this.walletController.comparePassword(psw)
  }

  setCurrentNetwork(network) {
    return this.networkController.setCurrentNetwork(network)
  }

  getCurrentNetwork() {
    return this.networkController.getCurrentNetwork()
  }

  getAllNetworks() {
    return this.networkController.getAllNetworks()
  }

  addNetwork(network) {
    return this.networkController.addNetwork(network)
  }

  deleteCurrentNetwork() {
    return this.networkController.deleteCurrentNetwork()
  }

  addAccount({ account, isCurrent }) {
    return this.walletController.addAccount(account, isCurrent)
  }

  isAccountNameAlreadyExists({ name }) {
    return this.walletController.isAccountNameAlreadyExists(name)
  }

  getCurrentAccount() {
    return this.walletController.getCurrentAccount()
  }

  getAllAccounts() {
    return this.walletController.getAllAccounts()
  }

  setCurrentAccount({ currentAccount }) {
    return this.walletController.setCurrentAccount(currentAccount)
  }

  updateNameAccount({ current, newName }) {
    return this.walletController.updateNameAccount(current, newName)
  }

  updateAvatarAccount({ current, avatar }) {
    return this.walletController.updateAvatarAccount(current, avatar)
  }

  deleteAccount({ account }) {
    return this.walletController.deleteAccount(account)
  }

  generateSeed(length = 81) {
    return this.walletController.generateSeed(length)
  }

  checkSession() {
    return this.sessionController.checkSession()
  }

  deleteSession() {
    return this.sessionController.deleteSession()
  }

  getState() {
    return this.walletController.getState()
  }

  setState(state) {
    return this.walletController.setState(state)
  }

  closePopup() {
    return this.popupController.closePopup()
  }

  executeRequest(request) {
    return this.customizatorController.executeRequest(request)
  }

  pushRequest(method, { uuid, resolve, data, website }) {
    this.customizatorController.pushRequest({
      method,
      uuid,
      resolve,
      data,
      website
    })
  }

  getRequests() {
    return this.customizatorController.getRequests()
  }

  getExecutableRequests() {
    return this.customizatorController.getExecutableRequests()
  }

  rejectRequests() {
    return this.customizatorController.rejectRequests()
  }

  confirmRequest(request) {
    return this.customizatorController.confirmRequest(request)
  }

  rejectRequest(request) {
    return this.customizatorController.rejectRequest(request)
  }

  connect(uuid, resolve, website) {
    this.connectorController.connect(uuid, resolve, website)
    this.popupController.openPopup()
  }

  getConnection({ origin }) {
    return this.connectorController.getConnection(origin)
  }

  pushConnection(connection) {
    return this.connectorController.pushConnection(connection)
  }

  updateConnection(connection) {
    return this.connectorController.updateConnection(connection)
  }

  completeConnection() {
    const requests = this.connectorController.completeConnection(
      this.customizatorController.getRequests()
    )
    this.customizatorController.setRequests(requests)
    return true
  }

  rejectConnection() {
    const requests = this.connectorController.rejectConnection(
      this.customizatorController.getRequests()
    )
    this.customizatorController.setRequests(requests)
    this.popupController.closePopup()
    return true
  }

  estabilishConnection(website) {
    return this.connectorController.estabilishConnection(website)
  }

  getConnections() {
    return this.connectorController.getConnections()
  }

  removeConnection(connection) {
    return this.connectorController.removeConnection(connection)
  }

  addConnection(connection) {
    return this.connectorController.addConnection(connection)
  }

  getConnectionRequest() {
    return this.connectorController.getConnectionRequest()
  }

  createSeedVault(password) {
    return this.seedVaultController.createSeedVault(password)
  }

  startFetchMam(options) {
    const network = this.networkController.getCurrentNetwork()
    this.mamController.fetchFromPopup(
      network.provider,
      options.root,
      options.mode,
      options.sideKey,
      data => {
        backgroundMessanger.newMamData(data)
      }
    )
  }

  reloadAccountData() {
    return this.accountDataController.loadAccountData()
  }

  getMamChannels() {
    return this.mamController.getMamChannels()
  }

  registerMamChannel(channel) {
    return this.mamController.registerMamChannel(channel)
  }

  lockWallet() {
    return this.walletController.lockWallet()
  }

  setPopupSettings(settings) {
    this.stateStorageController.set('popupSettings', settings, true)
  }

  getPopupSettings() {
    return this.stateStorageController.get('popupSettings')
  }

  enableTransactionsAutoPromotion(time) {
    this.transactionsAutoPromotionHandler = setInterval(
      () => {
        if (this.stateStorageController.isReady())
          this.accountDataController.promoteTransactions()
      },
      time > 3 ? time : 3
    )
  }

  disableTransactionsAutoPromotion() {
    clearInterval(this.transactionsAutoPromotionHandler)
  }
}

export default PegasusEngine
