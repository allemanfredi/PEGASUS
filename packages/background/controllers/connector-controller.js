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

  setWalletController(walletController) {
    this.walletController = walletController
  }

  setNetworkController(networkController) {
    this.networkController = networkController
  }

  getConnection(origin) {
    if (!this.stateStorageController.isReady()) {
      return null
    }

    if (
      this.connectionToStore &&
      this.connectionToStore.website.origin === origin
    ) {
      const connection = this.connectionToStore
      this.pushConnection(connection)
      this.connectionToStore = null
      return connection
    }
    const connections = this.stateStorageController.get('connections')
    const connection = connections.find(conn => conn.website.origin === origin)

    return connection
  }

  pushConnection(connection) {
    const connections = this.stateStorageController.get('connections')
    const existingConnection = connections.find(
      conn => conn.website.origin === connection.website.origin
    )

    if (existingConnection) {
      this.updateConnection(connection)
    } else {
      connections.push(connection)
      this.stateStorageController.set('connections', connections)
    }
  }

  updateConnection(connection) {
    const connections = this.stateStorageController.get('connections')
    const updatedConnections = connections.map(conn => {
      if (conn.website.origin === connection.website.origin) {
        return connection
      } else {
        return conn
      }
    })
    this.stateStorageController.set('connections', updatedConnections)
  }

  connect(uuid, resolve, website) {
    const connection = {
      website,
      requestToConnect: true,
      connected: false,
      enabled: false
    }

    const connectionRequest = {
      uuid,
      resolve,
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

  completeConnection(requests) {
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
    requests.forEach(request => {
      if (request.connection.website.origin === website.origin) {
        request.connection.requestToConnect = false
        request.connection.enabled = true
        request.connection.connected = true

        this.updateConnection(request.connection)
      }
    })

    backgroundMessanger.setSelectedAccount(account.data.latestAddress)

    return requests
  }

  rejectConnection(requests) {
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

    requests.forEach(request => {
      if (request.connection.website.origin === website.origin) {
        request.connection.requestToConnect = false
        request.connection.enabled = false
        request.connection.connected = false
      }
    })

    this.walletController.setState(APP_STATE.WALLET_UNLOCKED)

    return requests
  }

  setCurrentWebsite(website) {
    this.website = website
  }

  getCurrentWebsite() {
    return this.website
  }

  setConnectionToStore(connection) {
    this.connectionToStore = connection
  }

  getConnectionToStore() {
    return this.connectionToStore
  }

  setConnectionRequest(connection) {
    this.connectionRequest = connection
  }

  getConnectionRequest() {
    return this.connectionRequest
  }

  getConnections() {
    return this.stateStorageController.get('connections')
  }

  removeConnection(connectionToRemove) {
    const connections = this.stateStorageController.get('connections')
    const filteredConnections = connections.filter(
      connection =>
        connection.website.hostname !== connectionToRemove.website.hostname
    )
    this.stateStorageController.set('connections', filteredConnections)
    return true
  }

  addConnection(connection) {
    const connections = this.stateStorageController.get('connections')
    const alreadyPresent = connections.find(
      con => con.website.hostname === connection.website.hostname
    )
    if (alreadyPresent) return false

    connections.push(connection)
    this.stateStorageController.set('connections', connections)
    return true
  }
}

export default ConnectorController
