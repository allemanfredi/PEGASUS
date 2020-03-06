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
    if (!this.stateStorageController) {
      return null
    }

    //not check on accountId because the wallet is still locked and it is not possible to retrieve the current account
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
    const account = this.walletController.getCurrentAccount()
    const connections = this.stateStorageController.get('connections')
    const existingConnection = connections.find(
      conn => conn.website.origin === connection.website.origin
    )

    if (existingConnection) {
      this.updateConnection(
        Object.assign({}, connection, {
          accountId: account.id
        })
      )
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
    this.stateStorageController.set('connections', updatedConnections, true)
  }

  //usefull when user change name since accountid = hash(accountName)
  updateConnectionsAccountId(currentAccountId, newAccountId) {
    const connections = this.stateStorageController.get('connections')
    const updatedConnections = connections.map(connection => {
      if (connection.accountId === currentAccountId) {
        connection.accountId = newAccountId
      }

      return connection
    })
    this.stateStorageController.set('connections', updatedConnections, true)
  }

  connect(uuid, resolve, website) {
    const account = this.walletController.getCurrentAccount()

    const connection = {
      website,
      requestToConnect: true,
      connected: false,
      enabled: false,
      accountId: account ? account.id : null
    }

    const connectionRequest = {
      uuid,
      resolve,
      connection
    }
    this.setConnectionRequest(connectionRequest)

    //if user call connect before log in, storage is not already set up so it is not possible to save/load data
    //workardund -> keep in memory and once he login, store the data into storage and delete the variable
    const isStorageControllerReady = this.stateStorageController.isReady()
    if (!isStorageControllerReady) {
      this.setConnectionToStore(connection)
    } else {
      this.pushConnection(connection)
    }
  }

  completeConnection(requests) {
    const website = this.getCurrentWebsite()
    const connectionRequest = this.getConnectionRequest()
    const account = this.walletController.getCurrentAccount()
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
      if (
        request.connection.website.origin === website.origin &&
        (request.connection.accountId === account.id ||
          !request.connection.accountId)
      ) {
        request.connection.accountId = account.id
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
    const account = this.walletController.getCurrentAccount()

    if (connectionRequest) {
      connectionRequest.resolve({
        data: false,
        success: true,
        uuid: connectionRequest.uuid
      })
      this.setConnectionRequest(null)
    }

    this.updateConnection({
      website,
      requestToConnect: false,
      connected: false,
      enabled: false,
      accountId: account.id
    })

    requests.forEach(request => {
      if (
        request.connection.website.origin === website.origin &&
        request.connection.accountId === account.id
      ) {
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
}

export default ConnectorController
