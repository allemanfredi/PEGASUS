class ConnectorController {

  constructor(storageController) {
    this.storageController = storageController
    this.connectionToStore = null      //local storage connection data
    this.connectionRequest = null      //callback for user response
  }

  setStorageController(storageController) {
    this.storageController = storageController
  }

  getConnection(origin) {
    if (!this.storageController) {
      return null
    }
    if (this.connectionToStore && this.connectionToStore.website.origin === origin) {
      const connection = this.connectionToStore
      this.pushConnection(connection)
      this.connectionToStore = null
      return connection
    }
    const connections = this.storageController.getConnections()
    const connection = connections.find(c => c.website.origin === origin)
    return connection
  }

  pushConnection(connection) {
    const connections = this.storageController.getConnections()
    const existingConnection = connections.find(c => c.website.origin === connection.website.origin)
    if (existingConnection) {
      this.updateConnection(connection)
    } else {
      connections.push(connection)
      this.storageController.setConnections(connections)
    }    
  }

  updateConnection(connection) {
    const connections = this.storageController.getConnections()
    const updatedConnections = connections.map(c => {
      if (c.website.origin === connection.website.origin) {
        return connection
      } else {
        return c
      }
    })
    this.storageController.setConnections(updatedConnections)
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