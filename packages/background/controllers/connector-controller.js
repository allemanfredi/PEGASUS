import { backgroundMessanger } from '@pegasus/utils/messangers'
import { APP_STATE } from '@pegasus/utils/states'

class ConnectorController {
  constructor(options) {
    const { stateStorageController, state } = options

    this.stateStorageController = stateStorageController
    this.connectionToStore = null //local storage connection data
    this.connectionRequest = null //callback for user response
    this.website = null
    this.state = state
  }

  setWalletController(_walletController) {
    this.walletController = _walletController
  }

  setNetworkController(_networkController) {
    this.networkController = _networkController
  }

  getConnection(_origin) {
    if (!this.stateStorageController.isReady()) {
      return null
    }

    if (
      this.connectionToStore &&
      this.connectionToStore.website.origin === _origin
    ) {
      const connection = this.connectionToStore
      this.pushConnection(connection)
      this.connectionToStore = null
      return connection
    }
    const connections = this.stateStorageController.get('connections')
    const connection = connections.find(conn => conn.website.origin === _origin)

    return connection
  }

  pushConnection(_connection) {
    const connections = this.stateStorageController.get('connections')
    const existingConnection = connections.find(
      connection => connection.website.origin === _connection.website.origin
    )

    if (existingConnection) {
      this.updateConnection(_connection)
    } else {
      connections.push(_connection)
      this.stateStorageController.set('connections', connections)
    }
  }

  updateConnection(_connection) {
    const connections = this.stateStorageController.get('connections')
    const updatedConnections = connections.map(connection => {
      if (connection.website.origin === _connection.website.origin) {
        return _connection
      } else {
        return connection
      }
    })
    this.stateStorageController.set('connections', updatedConnections)
  }

  connect(_uuid, _resolve, _website) {
    const connection = {
      website: _website,
      requestToConnect: true,
      connected: false,
      enabled: false
    }

    const connectionRequest = {
      uuid: _uuid,
      resolve: _resolve,
      connection
    }
    this.setConnectionRequest(connectionRequest)

    //if user call connect before log in, storage is not already set up so it is not possible to save/load data
    //workardund -> keep in memory and once he login, store the data into storage and delete the variable
    if (!this.stateStorageController.isReady()) {
      this.setConnectionToStore(connection)
    } else {
      this.pushConnection(connection)
    }
  }

  completeConnection(_requests) {
    const account = this.walletController.getCurrentAccount()
    const website = this.getCurrentWebsite()
    const connectionRequest = this.getConnectionRequest()
    if (connectionRequest) {
      connectionRequest.resolve({
        data: true,
        success: true,
        uuid: connectionRequest.uuid
      })
      this.setConnectionRequest(null)
    }

    //in case there was already the connection stored
    _requests.forEach(request => {
      if (request.connection.website.origin === website.origin) {
        request.connection.requestToConnect = false
        request.connection.enabled = true
        request.connection.connected = true

        this.updateConnection(request.connection)
      }
    })

    backgroundMessanger.setSelectedAccount(account.data.latestAddress)

    return _requests
  }

  rejectConnection(_requests) {
    const website = this.getCurrentWebsite()
    const connectionRequest = this.getConnectionRequest()

    if (connectionRequest) {
      connectionRequest.resolve({
        data: false,
        success: true,
        uuid: connectionRequest.uuid
      })
      this.setConnectionRequest(null)
    }

    this.removeConnection({
      website,
      requestToConnect: false,
      connected: false,
      enabled: false
    })

    _requests.forEach(request => {
      if (request.connection.website.origin === website.origin) {
        request.connection.requestToConnect = false
        request.connection.enabled = false
        request.connection.connected = false
      }
    })

    this.walletController.setState(APP_STATE.WALLET_UNLOCKED)

    return _requests
  }

  setCurrentWebsite(_website) {
    this.website = _website
  }

  getCurrentWebsite() {
    return this.website
  }

  setConnectionToStore(_connection) {
    this.connectionToStore = _connection
  }

  getConnectionToStore() {
    return this.connectionToStore
  }

  setConnectionRequest(_connection) {
    this.connectionRequest = _connection
  }

  getConnectionRequest() {
    return this.connectionRequest
  }

  getConnections() {
    return this.stateStorageController.get('connections')
  }

  removeConnection(_connectionToRemove) {
    const connections = this.stateStorageController.get('connections')
    const filteredConnections = connections.filter(
      connection =>
        connection.website.hostname !== _connectionToRemove.website.hostname
    )
    this.stateStorageController.set('connections', filteredConnections)
    return true
  }

  addConnection(_connection) {
    const connections = this.stateStorageController.get('connections')
    const alreadyPresent = connections.find(
      connection => connection.website.hostname === _connection.website.hostname
    )
    if (alreadyPresent) return false

    connections.push(_connection)
    this.stateStorageController.set('connections', connections)
    return true
  }
}

export default ConnectorController
