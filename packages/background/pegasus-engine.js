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
import LoginPasswordController from './controllers/login-password-controller'
import { APP_STATE } from '@pegasus/utils/states'
import logger from '@pegasus/utils/logger'
import pump from 'pump'
import createEngineStream from './lib/engine-stream'
import { EventEmitter } from 'eventemitter3'
import { composeAPI } from '@iota/core'
import Dnode from 'dnode/browser'
import Utils from '@pegasus/utils/utils'

const SESSION_TIME = 30000

const forbiddenRequests = ['getAccountData', 'getNewAddress', 'getInputs']

class PegasusEngine extends EventEmitter {
  constructor() {

    super()

    this.requests = []
    this.accountDataHandler = false
    this.transactionsAutoPromotionHandler = false

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

    this.loginPasswordController = new LoginPasswordController({
      stateStorageController: this.stateStorageController
    })

    this.walletController = new walletController({
      stateStorageController: this.stateStorageController,
      networkController: this.networkController,
      connectorController: this.connectorController,
      loginPasswordController: this.loginPasswordController
    })

    this.accountDataController = new AccountDataController({
      networkController: this.networkController,
      walletController: this.walletController,
      notificationsController: this.notificationsController,
      stateStorageController: this.stateStorageController
    })

    this.sessionController = new SessionsController({
      walletController: this.walletController,
      stateStorageController: this.stateStorageController,
      customizatorController: this.customizatorController,
      loginPasswordController: this.loginPasswordController
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

    /*const state = this.walletController.getState()
    if (!this.walletController.isWalletSetup()) {
      this.walletController.setState(APP_STATE.WALLET_NOT_INITIALIZED)
    }

    if (state === APP_STATE.WALLET_INITIALIZED)
      this.walletController.setState(APP_STATE.WALLET_LOCKED)

    const currentNetwork = this.networkController.getCurrentNetwork()
    if (!currentNetwork) {
      this.networkController.setCurrentNetwork(settings.networks[0])
    }

    this.sessionController.checkSession()
    setInterval(() => this.sessionController.checkSession(), SESSION_TIME)

    const popupSettings = this.getPopupSettings()
    if (popupSettings.autoPromotion.enabled)
      this.accountDataController.enableTransactionsAutoPromotion(
        parseInt(popupSettings.autoPromotion.time * 1000 * 60)
      )*/
  }

  /**
   * Create a connection between the inpageClient and the engine
   * 
   * @param {Stream} outStream 
   * @param {Object} sender 
   */
  setupInpageClientConnection(outStream, sender) {
    const url = new URL(sender.url)

    const website = {
      origin: url.origin,
      hostname: url.hostname,
      title: sender.tab.title,
      favicon: sender.tab.favIconUrl
    }

    const inpageClientStream = createEngineStream(this, website)

    //const connectionId = 

    /*const account = this.connectorController.estabilishConnection(website)
    console.log(account)*/

    this.connectorController.estabilishConnection(website)

    pump(
      outStream,
      inpageClientStream,
      outStream,
      (err) => {
        if (err) {
          logger.error(err)
        }
      }
    )
  }

  /**
   * Create a connection with the popup by exposing the engine APIs
   * 
   * @param {Stream} outStream 
   */
  setupEngineConnectionWithPopup (outStream) {
    const api = this.getApi()
    const dnode = Dnode(api)

    pump(
      outStream,
      dnode,
      outStream,
      (err) => {
        if (err) {
          log.error(err)
        }
      }
    )
    dnode.on('remote', remote => {
      const {
        sendUpdate
      } = remote

      this.stateStorageController.state$.subscribe(_state => {
        //backgroundMessanger.changeGlobalState(_state)
        //console.log(_state)

        //before sending the update, the _state objecy must be modified, we need to remove the seed from obj to send to the popup
        sendUpdate(_state)
      })
    })
  }

  /**
   * Handle a request from tabs
   * 
   * @param {Object} _request 
   */
  handle(_request) {
    console.log('Handling new request', _request)

    const iota = composeAPI()
    if (iota[_request.method] && !forbiddenRequests.includes(_request.method)) {
      this.customizatorController.pushRequest(_request)
    }

    /*this.customizatorController.pushRequest({
      method,
      uuid,
      resolve,
      data,
      website
    })*/


    return 'hello'
  }


  getApi() {
    return {
      isWalletSetup: (...params) => new Promise(resolve => resolve(this.walletController.isWalletSetup(params)))
    }
  }


  // WALLET BACKGROUND API
  isWalletSetup() {
    return this.walletController.isWalletSetup()
  }

  unlockWallet(password) {
    return this.walletController.unlockWallet(password)
  }

  restoreWallet({ account, password }) {
    return this.walletController.restoreWallet(account, password)
  }

  unlockSeed(password) {
    return this.walletController.unlockSeed(password)
  }

  initWallet({ password, account }) {
    return this.walletController.initWallet(password, account)
  }

  comparePassword(password) {
    return this.loginPasswordController.comparePassword(password)
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
    return this.accountDataController.enableTransactionsAutoPromotion(time)
  }

  disableTransactionsAutoPromotion() {
    return this.accountDataController.disableTransactionsAutoPromotion()
  }
}

export default PegasusEngine
