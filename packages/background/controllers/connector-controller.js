import { backgroundMessanger } from '@pegasus/utils/messangers'
import { APP_STATE } from '@pegasus/utils/states'
import extension from 'extensionizer'
import Url from 'url-parse'

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
    this.walletController.setState(APP_STATE.WALLET_REQUEST_PERMISSION_OF_CONNECTION)
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
      uuid: _uuid,
    }

    console.log("new connect request",  this.connectionRequest)

    this.walletController.setState(APP_STATE.WALLET_REQUEST_PERMISSION_OF_CONNECTION)
  }

  completeConnection(_connection, _requests) {
    console.log("completing",_connection, _requests)

    const account = this.walletController.getCurrentAccount()
    if (this.connectionRequest.resolve) {
      this.connectionRequest.resolve({
        data: true,
        success: true,
        uuid: this.connectionRequest.uuid
      })
    }

    this.connectionRequest = null

    this.connections[_connection.website.origin] = Object.assign({}, _connection, {
      enabled: true
    })

    _requests.forEach(request => {
      if (request.connection.website.origin === _connection.website.origin) {
        request.connection.requestToConnect = false
        request.connection.enabled = true
      }
    })

    backgroundMessanger.setSelectedAccount(account.data.latestAddress)

    return _requests
  }

  rejectConnection(_connection, _requests) {
    if (this.connectionRequest.resolve) {
      this.connectionRequest.resolve({
        data: false,
        success: true,
        uuid: this.connectionRequest.uuid
      })
      this.connectionRequest = null
    }

    this.removeConnection({
      website: _connection.website,
      requestToConnect: false,
      enabled: false
    })

    _requests.forEach(request => {
      if (request.connection.website.origin === _connection.website.origin) {
        request.connection.requestToConnect = false
        request.connection.enabled = false
      }
    })

    return _requests
  }

  estabilishConnection(website) {

    if (this.connections[website.origin])
      return

    this.connections[website.origin] = {
      website,
      requestToConnect: false,
      enabled: false,
    }
    console.log(
      'estabilished connection',
      this.connections[website.origin],
      website.origin
    )
  }

  setConnectionRequest(_connection) {
    this.connectionRequest = _connection
  }

  getConnections() {
    return this.connections
  }

  removeConnection(_connectionToRemove) {
    delete this.connections[_connectionToRemove.website.origin]
    return true
  }

  addConnection(_connection) {
    if (this.connections[_connection.website.origin]) return false

    this.connections[_connection.website.origin] = _connection
    return true
  }
}

export default ConnectorController
