class ConnectorController {

  constructor(options) {

    const {
      storageController
    } = options
    
    this.storageController = storageController
    this.connectionToStore = null      //local storage connection data
    this.connectionRequest = null      //callback for user response
    this.website = null
  }

  setWalletController (walletController) {
    this.walletController = walletController
  }

  getConnection(origin, accountId) {
    if (!this.storageController) {
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
    const connections = this.storageController.getConnections()
    const connection = connections.find(conn => 
      conn.website.origin === origin && conn.accountId === accountId
    )

    return connection
  }

  pushConnection(connection) {
    const connections = this.storageController.getConnections()
    const existingConnection = connections.find(conn =>
       conn.website.origin === connection.website.origin && 
       conn.accountId === connection.accountId
    )

    if (existingConnection) {
      this.updateConnection(connection)
    } else {
      connections.push(connection)
      this.storageController.setConnections(connections)
    }    
  }

  updateConnection(connection) {
    const connections = this.storageController.getConnections()
    const updatedConnections = connections.map(conn => {
      if (
        conn.website.origin === connection.website.origin &&
        conn.accountId === connection.accountId
      ) {
        return connection
      } else {
        return conn
      }
    })
    this.storageController.setConnections(updatedConnections, true)
  }

  connect(uuid, resolve, website)  {

    const account = this.walletController.getCurrentAccount()

    const connection = {
      website,
      requestToConnect : true,
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
    const isStorageControllerReady = this.storageController.isReady()
    if (!isStorageControllerReady) {
      this.setConnectionToStore(connection)
    }
    else {
      this.pushConnection(connection)
    }
  }

  completeConnection(requests) {
    const website = this.getCurrentWebsite()
    const connectionRequest = this.getConnectionRequest()
    const account = this.walletController.getCurrentAccount()
    if (connectionRequest) {
      connectionRequest.resolve({
        data: {
          connected: true
        },
        success: true,
        uuid: connectionRequest.uuid
      })
      this.setConnectionRequest(null)
    }

    //in case there was already the connection stored
    requests.forEach(request => {
      if (
        request.connection.website.origin === website.origin &&
        (request.connection.accountId === account.id || !request.connection.accountId)
      ) {
        request.connection.accountId = account.id
        request.connection.requestToConnect = false
        request.connection.enabled = true
        request.connection.connected = true

        this.updateConnection(request.connection)
      }
    })

    return requests
  }

  rejectConnection(requests) {
    const website = this.getCurrentWebsite()
    const connectionRequest = this.getConnectionRequest()
    const account = this.walletController.getCurrentAccount()

    if (connectionRequest) {
      connectionRequest.resolve({
        data: {
          connected: false
        },
        success: true,
        uuid: connectionRequest.uuid
      })
      this.setConnectionRequest(null)
    }

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