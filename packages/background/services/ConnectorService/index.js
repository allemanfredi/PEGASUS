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
    if (this.connectionToStore && this.connectionToStore.website.origin === origin) {
      const connection = this.connectionToStore
      this.pushConnection(connection)
      this.connectionToStore = null
      return connection
    }
    const connections = this.storageDataService.getConnections()
    const connection = connections.find(c => c.website.origin === origin)
    return connection
  }

  pushConnection(connection) {
    const connections = this.storageDataService.getConnections()
    const existingConnection = connections.find(c => c.website.origin === connection.website.origin)
    if (existingConnection) {
      this.updateConnection(connection)
    } else {
      connections.push(connection)
      this.storageDataService.setConnections(connections)
    }    
  }

  updateConnection(connection) {
    const connections = this.storageDataService.getConnections()
    const updatedConnections = connections.map(c => {
      if (c.website.origin === connection.website.origin) {
        return connection
      } else {
        return c
      }
    })
    //console.log("to update", connection)
    //console.log("updated", updatedConnections)
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