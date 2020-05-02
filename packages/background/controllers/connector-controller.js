import { APP_STATE } from '@pegasus/utils/states'
import logger from '@pegasus/utils/logger'
import { normalizeConnectionRequests } from '../lib/connection-requests'

class ConnectorController {
  constructor(configs) {
    const { popupController, stateStorageController, updateBadge } = configs

    this.popupController = popupController
    this.stateStorageController = stateStorageController
    this.connections = {}
    this.connectionRequests = {}
    this.websiteMetadata = {}

    this.updateBadge = updateBadge
  }

  setWalletController(_walletController) {
    this.walletController = _walletController
  }

  setNetworkController(_networkController) {
    this.networkController = _networkController
  }

  setRequestsController(_customizatorController) {
    this.requestsController = _customizatorController
  }

  /**
   *
   * Check if a given origin is connected
   *
   * @param {String} _origin
   */
  isConnected(_origin) {
    return Boolean(
      this.connections[_origin] && this.connections[_origin].enabled
    )
  }

  /**
   *
   * Adds a pending connection used by RequestsController
   * whem user try to call a function from the content script
   * without having estabilished the connection
   *
   * @param {Object} _connection
   */
  pushConnectionRequest(_connection) {
    const { requestor } = _connection

    if (!this.connectionRequests[requestor.origin])
      this.connectionRequests[requestor.origin] = {}

    this.connectionRequests[requestor.origin][requestor.tabId] = _connection

    //NOTE: attach metadata
    this.connectionRequests[requestor.origin][requestor.tabId].requestor = {
      ...this.connectionRequests[requestor.origin][requestor.tabId].requestor,
      ...this.websiteMetadata[requestor.origin]
    }

    this.stateStorageController.set(
      'connectionRequests',
      normalizeConnectionRequests(this.connectionRequests)
    )

    this.updateBadge()

    this.walletController.setState(
      APP_STATE.WALLET_REQUEST_PERMISSION_OF_CONNECTION
    )
  }

  /**
   * Get all website connections
   */
  getConnections() {
    return this.connections
  }

  /**
   *
   * Get a connection given the origin
   *
   * @param {String} _origin
   */
  getConnection(_origin) {
    return this.connections[_origin]
  }

  /**
   * Get all pending connection to be confirmed
   */
  getConnectionRequests() {
    return normalizeConnectionRequests(this.connectionRequests)
  }

  /**
   *
   * Function called directly from the content script with .connect
   *
   * @param {String} _uuid
   * @param {Function} _push
   * @param {Object} _requestor
   */
  connect(_uuid, _push, _requestor) {
    this.pushConnectionRequest({
      requestor: _requestor,
      requestToConnect: true,
      enabled: false,
      push: _push,
      uuid: _uuid
    })

    logger.log(
      `(ConnectorController) New _connect request with ${_requestor.origin}`
    )

    this.walletController.setState(
      APP_STATE.WALLET_REQUEST_PERMISSION_OF_CONNECTION
    )

    this.popupController.openPopup()
  }

  /**
   *
   * Complete a connection after the user confirmation
   * in the popup
   *
   * @param {String} _origin
   * @param {Number} _tabId
   */
  completeConnectionRequest(_origin, _tabId) {
    const requests = this.requestsController.getRequests()

    logger.log(
      `(ConnectorController) Completing connection with ${_origin} - ${_tabId}`
    )

    if (this.connectionRequests[_origin][_tabId].push) {
      this.connectionRequests[_origin][_tabId].push({
        response: true,
        success: true,
        uuid: this.connectionRequests[_origin][_tabId].uuid
      })
    }

    this.connections[_origin] = Object.assign(
      {},
      this.connectionRequests[_origin][_tabId],
      {
        enabled: true
      }
    )

    // NOTE: tabId not nedeed to check if a connection with an origin is enabled
    delete this.connections[_origin].tabId

    const requestWithUserInteraction = requests.filter(
      request => request.needUserInteraction
    )

    requests.forEach(request => {
      if (request.connection.requestor.origin === _origin) {
        request.connection.requestToConnect = false
        request.connection.enabled = true

        if (!request.needUserInteraction)
          this.requestsController.confirmRequest(request)
      }
    })

    this.removeConnectionRequest(_origin, _tabId)

    if (
      requestWithUserInteraction.length === 0 &&
      Object.values(this.connectionRequests).length === 0
    ) {
      this.popupController.closePopup()
      this.walletController.setState(APP_STATE.WALLET_UNLOCKED)
    }

    const account = this.walletController.getCurrentAccount()
    const network = this.networkController.getCurrentNetwork()
    this.walletController.emit(
      'accountChanged',
      account.data[network.type].latestAddress
    )

    return true
  }

  /**
   *
   * Rejects a pending connection from the popup
   *
   * @param {String} _origin
   * @param {Integer} _tabId
   */
  rejectConnectionRequest(_origin, _tabId) {
    const requests = this.requestsController.getRequests()

    logger.log(`(ConnectorController) Rejecting connection with ${_origin}`)

    // NOTE: if it's a connect request from tab
    if (this.connectionRequests[_origin][_tabId].push) {
      this.connectionRequests[_origin][_tabId].push({
        response: false,
        success: true,
        uuid: this.connectionRequests[_origin][_tabId].uuid
      })
    }

    requests.forEach(request => {
      if (request.connection.requestor.origin === _origin)
        this.requestsController.removeRequest(request)
    })

    this.removeConnectionRequest(_origin, _tabId)
    this.removeConnection(_origin)

    if (Object.values(this.connectionRequests).length === 0) {
      this.popupController.closePopup()
      this.walletController.setState(APP_STATE.WALLET_UNLOCKED)
    }

    return true
  }

  /**
   *
   * Function used to estabilish a connection with a website,
   *
   * @param {Object} _requestor
   */
  estabilishConnection(_requestor) {
    // NOTE: connector not enabled for internal processes
    if (_requestor.hostname === 'pegasus') {
      logger.log(
        '(ConnectorController) Internal process asked to connect -> Connected'
      )
      this.connections[_requestor.origin] = {
        requestor: _requestor,
        requestToConnect: false,
        enabled: true
      }
      return
    }

    logger.log(
      `(ConnectorController) Estabilishing connection with ${_requestor.origin}`
    )

    const account = this.walletController.getCurrentAccount()
    const state = this.walletController.getState()

    if (this.connections[_requestor.origin]) {
      if (
        this.connections[_requestor.origin].enabled &&
        state >= APP_STATE.WALLET_UNLOCKED
      ) {
        logger.log(
          `(ConnectorController) Connection with ${_requestor.origin} already enabled`
        )
        return account.data.latestAddress
      }
    }

    this.connections[_requestor.origin] = {
      requestor: _requestor,
      requestToConnect: false,
      enabled: false
    }

    return null
  }

  /**
   *
   * Remove an estabilished connection with a website
   *
   * @param {String} _origin
   */
  removeConnection(_origin) {
    logger.log(`(ConnectorController) Removing connection with ${_origin}`)
    delete this.connections[_origin]
    return true
  }

  /**
   *
   * Remove a pending connection with a website and its relative
   * website metadata
   *
   * @param {String} _origin
   */
  removePendingConnection(_origin) {
    if (this.connections[_origin] && !this.connections[_origin].enabled) {
      logger.log(
        `(ConnectorController) Removing pending connection with ${_origin}`
      )
      delete this.connections[_origin]
      delete this.websiteMetadata[_origin]
    }
    return true
  }

  /**
   *
   * Remove a pending connection and update the badge
   *
   * @param {String} _origin
   * @param {Number} _tabId
   */
  removeConnectionRequest(_origin, _tabId) {
    delete this.connectionRequests[_origin][_tabId]

    if (Object.values(this.connectionRequests[_origin]).length === 0)
      delete this.connectionRequests[_origin]

    this.updateBadge()
    this.stateStorageController.set(
      'connectionRequests',
      normalizeConnectionRequests(this.connectionRequests)
    )
  }

  /**
   *
   * Add a connection with a website
   *
   * @param {Object} _connection
   */
  addConnection(_connection) {
    logger.log(
      `(ConnectorController) Add connection with ${_connection.requestor.origin}`
    )
    if (this.connections[_connection.requestor.origin]) return false

    this.connections[_connection.requestor.origin] = _connection
    return true
  }

  /**
   *
   * Attach metadata to pending and estabilished connection
   *
   * @param {String} _origin
   * @param {Object} _metadata
   */
  attachMetadata(_origin, _metadata) {
    logger.log(`(ConnectorController) Attacching ${_origin} metadata`)

    this.websiteMetadata[_origin] = _metadata

    if (this.connections[_origin]) {
      this.connections[_origin].requestor = {
        ...this.connections[_origin].requestor,
        ..._metadata
      }
    }
  }
}

export default ConnectorController
