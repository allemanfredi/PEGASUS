class ConnectorService {

  constructor(storageDataService) {
    this.storageDataService = storageDataService
    this.connectionToStore = null      //local storage connection data
    this.connectionRequest = null      //callback for user response
  }

  setStorageDataService(storageDataService) {
    this.storageDataService = storageDataService
  }

  getConnection(origin) {
    if (!this.storageDataService) {
      return null
    }
    if (this.connectionToStore) {
      const connection = this.connectionToStore
      this.pushConnection(connection)
      this.connectionToStore = null
      return connection
    }
    const connections = this.storageDataService.getConnections()
    const connection = connections.find(c => c.origin === origin)
    return connection
  }

  pushConnection(connection) {
    const connections = this.storageDataService.getConnections()
    const existingConnection = connections.find(c => c.origin === origin)
    if (existingConnection) {
      this.updateConnection(existingConnection)
    } else {
      connections.push(connection)
    }
    this.storageDataService.setConnections(connections)
  }

  updateConnection(connection) {
    const connections = this.storageDataService.getConnections()
    const updatedConnections = connections.map(c => {
      if (c.origin === connection.origin) {
        return connection
      } else {
        return c
      }
    })
    this.storageDataService.setConnections(updatedConnections)
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

export default ConnectorService