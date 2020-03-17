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
import nodeify from 'nodeify'

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
      walletController: this.walletController,
      loginPasswordController: this.loginPasswordController
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
    this.connectorController.setCustomizatorController(
      this.customizatorController
    )
    /* E N D   C O N T R O L L E R S */

    const state = this.walletController.getState()
    if (!this.walletController.isWalletSetup()) {
      this.walletController.setState(APP_STATE.WALLET_NOT_INITIALIZED)
    }

    if (state === APP_STATE.WALLET_INITIALIZED)
      this.walletController.setState(APP_STATE.WALLET_LOCKED)

    const currentNetwork = this.networkController.getCurrentNetwork()
    if (!currentNetwork) {
      this.networkController.setCurrentNetwork(settings.networks[0])
    }

    const popupSettings = this.walletController.getPopupSettings()
    if (popupSettings.autoPromotion.enabled)
      this.accountDataController.enableTransactionsAutoPromotion(
        parseInt(popupSettings.autoPromotion.time * 1000 * 60)
      )
  }

  /**
   * Create a connection between the inpageClient and the engine
   *
   * @param {Stream} outStream
   * @param {Object} port
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

    /*const account = this.connectorController.estabilishConnection(website)
    console.log(account)*/

    this.connectorController.estabilishConnection(website)

    pump(outStream, inpageClientStream, outStream, err => {
      if (err) {
        logger.error(err)
      }
    })
  }

  /**
   * Create a connection with the popup by exposing the engine APIs
   *
   * @param {Stream} outStream
   */
  setupEngineConnectionWithPopup(outStream) {
    const api = this.getApi()
    const dnode = Dnode(api)

    pump(outStream, dnode, outStream, err => {
      if (err) {
        logger.error(err)
      }
    })
    dnode.on('remote', remote => {
      const { sendUpdate } = remote

      this.stateStorageController.state$.subscribe(_state => {
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
    const { method, args, uuid, push, website } = _request

    const iota = composeAPI()
    if (iota[_request.method] && !forbiddenRequests.includes(_request.method)) {
      this.customizatorController.pushRequest(_request)
      return
    }

    switch (method) {
      case 'connect': {
        this.connectorController.connect(uuid, push, website)
        break
      }
      default: {
        push({
          success: 'false',
          data: 'Method Not Available'
        })
      }
    }
  }

  /**
   * Background api used by the popup
   */
  getApi() {
    return {
      isWalletSetup: cb => cb(this.walletController.isWalletSetup()),
      initWallet: (password, account, cb) =>
        nodeify(this.walletController.initWallet(password, account), cb),
      lockWallet: cb => nodeify(this.walletController.lockWallet(), cb),
      unlockWallet: (password, cb) =>
        nodeify(this.walletController.unlockWallet(password), cb),
      restoreWallet: (password, account, cb) =>
        nodeify(this.walletController.restoreWallet(password, account), cb),
      unlockSeed: (password, cb) =>
        nodeify(this.walletController.unlockSeed(password), cb),
      addAccount: (account, isCurrent, cb) =>
        nodeify(this.walletController.addAccount(account, isCurrent), cb),
      isAccountNameAlreadyExists: (name, cb) =>
        cb(this.walletController.isAccountNameAlreadyExists(name)),
      getCurrentAccount: cb => cb(this.walletController.getCurrentAccount()),
      getAllAccounts: cb => cb(this.walletController.getAllAccounts()),
      setCurrentAccount: (account, cb) =>
        cb(this.walletController.setCurrentAccount(account)),
      updateNameAccount: (account, newName, cb) =>
        cb(this.walletController.updateNameAccount(account, newName)),
      updateAvatarAccount: (account, avatar, cb) =>
        cb(this.walletController.updateAvatarAccount(account, avatar)),
      deleteAccount: (account, cb) =>
        cb(this.walletController.deleteAccount(account)),
      generateSeed: (length, cb) =>
        cb(this.walletController.generateSeed(length)),
      getState: cb => cb(this.walletController.getState()),
      setState: (state, cb) => cb(this.walletController.setState(state)),
      setPopupSettings: (settings, cb) =>
        cb(this.walletController.setPopupSettings(settings)),
      getPopupSettings: cb => cb(this.walletController.getPopupSettings()),

      //login password controller
      comparePassword: (password, cb) =>
        nodeify(this.loginPasswordController.comparePassword(password), cb),

      //session controller
      checkSession: cb => cb(this.sessionController.checkSession()),
      deleteSession: cb => cb(this.sessionController.deleteSession()),

      //network controller
      setCurrentNetwork: (network, cb) =>
        cb(this.networkController.setCurrentNetwork(network)),
      getCurrentNetwork: cb => cb(this.networkController.getCurrentNetwork()),
      getAllNetworks: cb => cb(this.networkController.getAllNetworks()),
      addNetwork: (network, cb) =>
        cb(this.networkController.addNetwork(network)),
      deleteCurrentNetwork: cb =>
        cb(this.networkController.deleteCurrentNetwork()),

      //popup controller
      closePopup: cb => cb(this.popupController.closePopup()),

      //customizator controller
      executeRequest: (request, cb) =>
        nodeify(this.customizatorController.executeRequest(request), cb),
      getRequests: cb => cb(this.customizatorController.getRequests()),
      getExecutableRequests: cb =>
        cb(this.customizatorController.getExecutableRequests()),

      rejectRequest: (request, cb) =>
        cb(this.customizatorController.rejectRequest(request)),
      rejectRequests: cb => cb(this.customizatorController.rejectRequests()),
      confirmRequest: (request, cb) =>
        nodeify(this.customizatorController.confirmRequest(request), cb),

      //connector controller
      getConnection: (origin, cb) =>
        cb(this.connectorController.getConnection(origin)),
      pushConnection: (connection, cb) =>
        cb(this.connectorController.pushConnection(connection)),
      updateConnection: (connection, cb) =>
        cb(this.connectorController.updateConnection(connection)),
      completeConnection: cb =>
        cb(this.connectorController.completeConnection()),
      rejectConnection: cb => cb(this.connectorController.rejectConnection()),
      getConnections: cb => cb(this.connectorController.getConnections()),
      removeConnection: (connection, cb) =>
        cb(this.connectorController.removeConnection(connection)),
      addConnection: (connection, cb) =>
        cb(this.connectorController.addConnection(connection)),
      getConnectionRequest: cb =>
        cb(this.connectorController.getConnectionRequest()),

      //seed vault controller
      createSeedVault: (loginPassword, encryptionPassword, cb) =>
        nodeify(
          this.seedVaultController.createSeedVault(
            loginPassword,
            encryptionPassword
          ),
          cb
        ),

      //mam controller
      fetchFromPopup: (options, cb) =>
        cb(this.mamController.fetchFromPopup(options)),
      getMamChannels: cb => cb(this.mamController.getMamChannels()),
      registerMamChannel: (channel, cb) =>
        cb(this.mamController.registerMamChannel(channel)),

      //accountData controller
      loadAccountData: cb =>
        nodeify(this.accountDataController.loadAccountData(), cb),

      enableTransactionsAutoPromotion: (time, cb) =>
        cb(this.accountDataController.enableTransactionsAutoPromotion(time)),

      disableTransactionsAutoPromotion: cb =>
        cb(this.accountDataController.disableTransactionsAutoPromotion())
    }
  }
}

export default PegasusEngine
