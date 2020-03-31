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

    this.updateBadge = updateBadge
  }

  setWalletController(_walletController) {
    this.walletController = _walletController
  }

  setNetworkController(_networkController) {
    this.networkController = _networkController
  }

  setCustomizatorController(_customizatorController) {
    this.customizatorController = _customizatorController
  }

  isConnected(_origin) {
    return this.connections[_origin] && this.connections[_origin].enabled
      ? true
      : false
  }

  pushConnectionRequest(_connection) {
    if (!this.connectionRequests[_connection.website.origin]) {
      this.connectionRequests[_connection.website.origin] = {}
    }

    this.connectionRequests[_connection.website.origin][
      _connection.website.tabId
    ] = _connection

    this.stateStorageController.set(
      'connectionRequests',
      normalizeConnectionRequests(this.connectionRequests)
    )

    this.updateBadge()

    this.walletController.setState(
      APP_STATE.WALLET_REQUEST_PERMISSION_OF_CONNECTION
    )
  }

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

  getConnectionRequests() {
    return normalizeConnectionRequests(this.connectionRequests)
  }

  connect(_uuid, _push, _website) {
    this.pushConnectionRequest({
      website: _website,
      requestToConnect: true,
      enabled: false,
      push: _push,
      uuid: _uuid
    })

    logger.log(
      `(ConnectorController) New _connect request with ${_website.origin}`
    )

    this.walletController.setState(
      APP_STATE.WALLET_REQUEST_PERMISSION_OF_CONNECTION
    )

    this.popupController.openPopup()
  }

  completeConnectionRequest(_origin, _tabId) {
    const requests = this.customizatorController.getRequests()

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
      if (request.connection.website.origin === _origin) {
        request.connection.requestToConnect = false
        request.connection.enabled = true

        if (!request.needUserInteraction)
          this.customizatorController.executeRequest(request)
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
    this.walletController.emit('accountChanged', account.data.latestAddress)

    return true
  }

  rejectConnectionRequest(_origin, _tabId) {
    const requests = this.customizatorController.getRequests()

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
      if (request.connection.website.origin === _origin) {
        this.customizatorController.removeRequest(request)
      }
    })

    this.removeConnectionRequest(_origin, _tabId)
    this.removeConnection(_origin)

    if (Object.values(this.connectionRequests).length === 0) {
      this.popupController.closePopup()
      this.walletController.setState(APP_STATE.WALLET_UNLOCKED)
    }

    return true
  }

  estabilishConnection(website) {
    const state = this.walletController.getState()
    if (state <= APP_STATE.WALLET_LOCKED) return

    logger.log(
      `(ConnectorController) Estabilishing connection with ${website.origin}`
    )

    const account = this.walletController.getCurrentAccount()

    if (this.connections[website.origin]) {
      if (
        this.connections[website.origin].enabled &&
        state >= APP_STATE.WALLET_UNLOCKED
      ) {
        logger.log(
          `(ConnectorController) Connection with ${website.origin} already enabled`
        )
        return account.data.latestAddress
      }
    }

    this.connections[website.origin] = {
      website,
      requestToConnect: false,
      enabled: false
    }

    return null
  }

  getConnections() {
    return this.connections
  }

  getConnection(_origin) {
    return this.connections[_origin]
  }

  removeConnection(_origin) {
    logger.log(`(ConnectorController) Removing connection with ${_origin}`)
    delete this.connections[_origin]
    return true
  }

  removePendingConnection(_origin) {
    if (this.connections[_origin] && !this.connections[_origin].enabled) {
      logger.log(
        `(ConnectorController) Removing pending connection with ${_origin}`
      )
      delete this.connections[_origin]
    }
    return true
  }

  addConnection(_connection) {
    logger.log(
      `(ConnectorController) Add connection with ${_connection.website.origin}`
    )
    if (this.connections[_connection.website.origin]) return false

    this.connections[_connection.website.origin] = _connection
    return true
  }
}

export default ConnectorController
