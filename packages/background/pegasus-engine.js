import options from '@pegasus/utils/options'
import PegasusWallController from './controllers/pegasus-wall-controller'
import MamController from './controllers/mam-controller'
import StateStorageController from './controllers/state-storage-controller'
import WalletController from './controllers/wallet-controller'
import PopupController from './controllers/popup-controller'
import SeedVaultController from './controllers/seed-vault-controller'
import NodeController from './controllers/node-controller'
import { APP_STATE } from '@pegasus/utils/states'
import logger from '@pegasus/utils/logger'
import pump from 'pump'
import createEngineStream from './lib/engine-stream'
import { composeAPI } from '@iota/core'
import Dnode from 'dnode/browser'
import nodeify from 'nodeify'
import { returnOnlyPublicConfigs, removeSeed } from './lib/removers'
import extensionizer from 'extensionizer'
import {
  FORBIDDEN_REQUESTS,
  ADDITIONAL_METHODS,
  CONNECT,
  WEBSITE_METADATA
} from './lib/constants'
import { addChecksum } from '@iota/checksum'

class PegasusEngine {
  constructor() {
    this.internalConnections = 0

    /* C O N T R O L L E R S */
    this.popupController = new PopupController()
    this.stateStorageController = new StateStorageController()

    this.walletController = new WalletController({
      stateStorageController: this.stateStorageController,
      walletController: this.walletController,
      showNotification: this.showNotification.bind(this),
      getInternalConnections: this.getInternalConnections.bind(this)
    })

    this.nodeController = new NodeController({
      walletController: this.walletController,
      stateStorageController: this.stateStorageController
    })

    this.mamController = new MamController({
      walletController: this.walletController
    })

    this.seedVaultController = new SeedVaultController({
      walletController: this.walletController
    })

    this.pegasusWallController = new PegasusWallController({
      popupController: this.popupController,
      stateStorageController: this.stateStorageController,
      nodeController: this.nodeController,
      walletController: this.walletController,
      updateBadge: this.updateBadge.bind(this)
    })
    /* E N D   C O N T R O L L E R S */

    const state = this.walletController.getState()
    if (!this.walletController.isWalletSetup())
      this.walletController.setState(APP_STATE.WALLET_NOT_INITIALIZED)

    if (state === APP_STATE.WALLET_INITIALIZED) {
      this.walletController.setState(APP_STATE.WALLET_LOCKED)
    }

    const currentNetwork = this.walletController.getCurrentNetwork()
    if (!currentNetwork)
      this.walletController.setCurrentNetwork(options.networks[0])

    const settings = this.walletController.getSettings()
    if (settings.autoPromotion.enabled) {
      this.accountDataController.enableTransactionsAutoPromotion(
        parseInt(settings.autoPromotion.time * 1000 * 60)
      )
    }
  }

  /**
   * Create a connection between the inpageClient and the engine
   *
   * @param {Stream} outStream
   * @param {Object} sender
   * @param {Bool} isInternal
   */
  setupUntrustedConnection(outStream, sender, isInternal) {
    const url = new URL(sender.url)

    // tabId = 0 is the popup
    const requestor = {
      origin: url.origin,
      hostname: isInternal ? 'pegasus' : url.hostname,
      tabId: sender.tab && sender.tab.id ? sender.tab.id : null
    }

    const inpageClientStream = createEngineStream(this, requestor)

    pump(outStream, inpageClientStream, outStream, err => {
      // NOTE: if connection with this requestor is not enabled it will be removed when user closes the page
      this.pegasusWallController.removePendingConnection(url.origin)
      if (err) logger.error(err)
    })

    // NOTE: disable account/provider notification for internal processes
    if (!isInternal)
      this.setupInpageClientDefaultValues(inpageClientStream, url)

    this.pegasusWallController.estabilishConnection(requestor)
  }

  /**
   * Create a connection with the popup by exposing the engine APIs
   *
   * @param {Stream} engineOutStream
   * @param {Stream} clientOutStream
   * @param {Object} sender
   */
  setupTrustedConnection(engineOutStream, clientOutStream, sender) {
    const api = this.getApi()
    const dnode = Dnode(api)

    this.setupUntrustedConnection(clientOutStream, sender, true)

    this.internalConnections += 1

    pump(engineOutStream, dnode, engineOutStream, err => {
      if (err) logger.error(err)
      this.internalConnections -= 1
    })
    dnode.on('remote', remote => {
      const { sendUpdate } = remote

      this.stateStorageController.state$.subscribe(_state => {
        // remove seed before sending
        sendUpdate(returnOnlyPublicConfigs(_state))
      })
    })
  }

  /**
   * Handle a request from tabs
   *
   * @param {Object} _request
   */
  handle(_request) {
    const { method, uuid, push, requestor, args } = _request

    const iota = composeAPI()
    if (
      iota[_request.method] &&
      !FORBIDDEN_REQUESTS.includes(_request.method)
    ) {
      this.pegasusWallController.pushRequest(_request)
      return
    }

    if (ADDITIONAL_METHODS.includes(_request.method)) {
      this.pegasusWallController.pushRequest(_request)
      return
    }

    if (method === WEBSITE_METADATA) {
      this.pegasusWallController.attachMetadata(requestor.origin, args)
      return
    }

    if (method === CONNECT) {
      this.pegasusWallController.connect(uuid, push, requestor)
      return
    }

    push({
      success: 'false',
      response: 'Method Not Available',
      uuid
    })
  }

  /**
   * Background api used by the popup
   */
  getApi() {
    return {
      // wallet controller
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
      getCurrentAccount: cb =>
        cb(removeSeed(this.walletController.getCurrentAccount())),
      getAllAccounts: cb =>
        cb(removeSeed(this.walletController.getAllAccounts())),
      setCurrentAccount: (account, cb) =>
        cb(this.walletController.setCurrentAccount(account)),
      updateNameAccount: (name, cb) =>
        cb(this.walletController.updateNameAccount(name)),
      updateAvatarAccount: (avatar, cb) =>
        cb(this.walletController.updateAvatarAccount(avatar)),
      deleteAccount: (account, cb) =>
        cb(this.walletController.deleteAccount(account)),
      getState: cb => cb(this.walletController.getState()),
      setState: (state, cb) => cb(this.walletController.setState(state)),
      setSettings: (settings, cb) =>
        cb(this.walletController.setSettings(settings)),
      getSettings: cb => cb(this.walletController.getSettings()),
      setCurrentNetwork: (network, cb) =>
        cb(this.walletController.setCurrentNetwork(network)),
      getCurrentNetwork: cb => cb(this.walletController.getCurrentNetwork()),
      getAllNetworks: cb => cb(this.walletController.getAllNetworks()),
      addNetwork: (network, cb) =>
        cb(this.walletController.addNetwork(network)),
      deleteCurrentNetwork: cb =>
        cb(this.walletController.deleteCurrentNetwork()),
      checkSession: cb => cb(this.walletController.checkSession()),
      deleteSession: cb => cb(this.walletController.deleteSession()),
      comparePassword: (password, cb) =>
        nodeify(this.walletController.comparePassword(password), cb),
      isUnlocked: cb => cb(this.walletController.isUnlocked()),
      enableTransactionsAutoPromotion: (time, cb) =>
        cb(this.walletController.enableTransactionsAutoPromotion(time)),
      disableTransactionsAutoPromotion: cb =>
        cb(this.walletController.disableTransactionsAutoPromotion()),
      enableTransactionsAutoReattachment: (time, cb) =>
        cb(this.walletController.enableTransactionsAutoReattachment(time)),
      disableTransactionsAutoReattachment: cb =>
        cb(this.walletController.disableTransactionsAutoReattachment()),

      // popup controller
      closePopup: cb => cb(this.popupController.closePopup()),

      // pegasus wallet controller
      getRequests: cb => cb(this.pegasusWallController.getRequests()),
      getExecutableRequests: cb =>
        cb(this.pegasusWallController.getExecutableRequests()),
      rejectRequest: (request, cb) =>
        cb(this.pegasusWallController.rejectRequest(request)),
      rejectRequests: cb => cb(this.pegasusWallController.rejectRequests()),
      confirmRequest: (request, cb) =>
        nodeify(this.pegasusWallController.confirmRequest(request), cb),
      completeConnectionRequest: (origin, tabId, cb) =>
        cb(this.pegasusWallController.completeConnectionRequest(origin, tabId)),
      rejectConnectionRequest: (origin, tabId, cb) =>
        cb(this.pegasusWallController.rejectConnectionRequest(origin, tabId)),
      getConnections: cb => cb(this.pegasusWallController.getConnections()),
      removeConnection: (origin, cb) =>
        cb(this.pegasusWallController.removeConnection(origin)),
      addConnection: (connection, cb) =>
        cb(this.pegasusWallController.addConnection(connection)),
      getConnectionRequests: cb =>
        cb(this.pegasusWallController.getConnectionRequests()),

      // seed vault controller
      createSeedVault: (loginPassword, encryptionPassword, cb) =>
        nodeify(
          this.seedVaultController.createSeedVault(
            loginPassword,
            encryptionPassword
          ),
          cb
        ),
      getSeedVaultContent: (encodedFile, password, cb) =>
        nodeify(
          this.seedVaultController.getSeedVaultContent(encodedFile, password),
          cb
        ),

      // mam controller
      fetchFromPopup: (opts, cb) => cb(this.mamController.fetch(opts)),

      // TODO: remove when UI will be refactored
      getRecentsAddresses: cb => cb(this.nodeController.getRecentsAddresses())
    }
  }

  /**
   * Send the current network provider to the inpageClient.
   * Also check if the connection with a requestor is already enabled,
   * in that case the engine it will send the address of the current account to the inpageClient.
   * In addition listens for network/account changing in order to send to the inpageClient.
   *
   * @param {DuplexStream} _inpageClient
   * @param {Url} _url
   */
  setupInpageClientDefaultValues(_inpageClient, _url) {
    this.walletController.on('accountChanged', account => {
      if (this.pegasusWallController.isConnected(_url.origin)) {
        _inpageClient.push({
          action: 'accountChanged',
          response: addChecksum(account)
        })
      }
    })

    this.walletController.on('providerChanged', provider => {
      _inpageClient.push({
        action: 'providerChanged',
        response: provider
      })
    })

    _inpageClient.push({
      action: 'providerChanged',
      response: this.walletController.getCurrentNetwork().provider
    })

    const account = this.walletController.getCurrentAccount()
    const network = this.walletController.getCurrentNetwork()
    if (this.pegasusWallController.isConnected(_url.origin) && account) {
      _inpageClient.push({
        action: 'accountChanged',
        response: addChecksum(account.data[network.type].latestAddress)
      })
    }
  }

  /**
   *
   * function for updating the number of requests from tabs
   */
  updateBadge() {
    const connectionRequests = this.pegasusWallController.getConnectionRequests()
    const requests = this.pegasusWallController.getRequests()

    const sum = connectionRequests.length + requests.length

    extensionizer.browserAction.setBadgeText({
      text: sum ? sum.toString() : ''
    })
    extensionizer.browserAction.setBadgeBackgroundColor({ color: 'darkblue' })
  }

  /**
   *
   * Function used to make appear notifications to the user
   * only when the popup is not opened
   *
   * @param {String} _title
   * @param {String} _message
   * @param {String} _url
   */
  showNotification(_title, _message, _url) {
    if (this.internalConnections === 0) {
      extensionizer.notifications.create(_url, {
        type: 'basic',
        title: _title,
        iconUrl: extensionizer.extension.getURL('images/pegasus-64.png'),
        message: _message
      })

      const viewOnBrowser = _url => {
        if (_url.startsWith('https')) extensionizer.tabs.create({ url: _url })
      }

      if (!extensionizer.notifications.onClicked.hasListener(viewOnBrowser))
        extensionizer.notifications.onClicked.addListener(viewOnBrowser)
    }
  }

  /**
   *
   * Function to get the number of active internal connections
   */
  getInternalConnections() {
    return this.internalConnections
  }
}

export default PegasusEngine
