import { backgroundMessanger } from '@pegasus/utils/messangers'
import { APP_STATE } from '@pegasus/utils/states'
import logger from '@pegasus/utils/logger'

class ConnectorController {
  constructor() {
    this.connections = {}
  }

  setWalletController(_walletController) {
    this.walletController = _walletController
  }

  setNetworkController(_networkController) {
    this.networkController = _networkController
  }

  getConnection(_origin) {
    return this.connections[_origin]
  }

  async pushConnection(_connection) {
    this.connections[_connection.website.origin] = _connection
  }

  setConnectionRequest(_connection) {
    this.connectionRequest = _connection
    this.walletController.setState(
      APP_STATE.WALLET_REQUEST_PERMISSION_OF_CONNECTION
    )
  }

  getConnectionRequest(_connection) {
    return this.connectionRequest
  }

  updateConnection(_connection) {
    this.connections[_connection.website.origin] = _connection
  }

  connect(_uuid, _resolve, _website) {
    this.connectionRequest = {
      website: _website,
      requestToConnect: true,
      enabled: false,
      resolve: _resolve,
      uuid: _uuid
    }

    logger.log(
      `New _connect request with ${this.connectionRequest.website.origin}`
    )

    this.walletController.setState(
      APP_STATE.WALLET_REQUEST_PERMISSION_OF_CONNECTION
    )
  }

  completeConnection(_requests) {
    logger.log(
      `Completing connection with ${this.connectionRequest.website.origin}`
    )

    const account = this.walletController.getCurrentAccount()
    if (this.connectionRequest.resolve) {
      this.connectionRequest.resolve({
        data: true,
        success: true,
        uuid: this.connectionRequest.uuid
      })
    }

    this.connections[this.connectionRequest.website.origin] = Object.assign(
      {},
      this.connectionRequest,
      {
        enabled: true
      }
    )

    _requests.forEach(request => {
      if (
        request.connection.website.origin ===
        this.connectionRequest.website.origin
      ) {
        request.connection.requestToConnect = false
        request.connection.enabled = true
      }
    })

    this.connectionRequest = null

    backgroundMessanger.setSelectedAccount(account.data.latestAddress)
    return _requests
  }

  rejectConnection(_requests) {
    logger.log(
      `Rejecting connection with ${this.connectionRequest.website.origin}`
    )

    if (this.connectionRequest.resolve) {
      this.connectionRequest.resolve({
        data: false,
        success: true,
        uuid: this.connectionRequest.uuid
      })
    }

    this.removeConnection({
      website: this.connectionRequest.website,
      requestToConnect: false,
      enabled: false
    })

    _requests.forEach(request => {
      if (
        request.connection.website.origin ===
        this.connectionRequest.website.origin
      ) {
        request.connection.requestToConnect = false
        request.connection.enabled = false
      }
    })

    this.connectionRequest = null

    return _requests
  }

  estabilishConnection(website) {
    logger.log(`Estabilishing connection with ${website.origin}`)

    if (this.connections[website.origin]) return

    this.connections[website.origin] = {
      website,
      requestToConnect: false,
      enabled: false
    }
  }

  setConnectionRequest(_connection) {
    this.connectionRequest = _connection
  }

  getConnections() {
    return this.connections
  }

  removeConnection(_connectionToRemove) {
    logger.log(`Remove connection with ${_connectionToRemove.website.origin}`)
    delete this.connections[_connectionToRemove.website.origin]
    return true
  }

  addConnection(_connection) {
    logger.log(`Add connection with ${_connection.website.origin}`)
    if (this.connections[_connection.website.origin]) return false

    this.connections[_connection.website.origin] = _connection
    return true
  }
}

export default ConnectorController
