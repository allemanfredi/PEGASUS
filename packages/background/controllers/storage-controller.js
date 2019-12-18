// class used to encrypt the content of wallet data in order to make more difficult the decryption of the seed since is encrypted togheter with other data (ex name, address ecc)
// options, state, password hash and session(timestamp for checking the last login) are not encrypted
import Utils from '@pegasus/utils/utils'

class StorageController {
  constructor () {
    this.encryptionkey = null
    this.data = null
    this.connections = []
    this.mamChannels = {}

    const edata = localStorage.getItem('data')
    if (!edata)
      this.setData([])

    const econnections = localStorage.getItem('connections')
    if (!econnections)
      this.setConnections([])

    const eMamChannels = localStorage.getItem('mamChannels')
    if (!eMamChannels)
      this.setMamChannels({})
  }

  isReady() {
    return this.encryptionkey ? true : false
  }

  setEncryptionKey(key) {
    this.encryptionkey = key
  }

  getData () {
    if (!this.data) {
      const edata = localStorage.getItem('data')
      this.data = Utils.aes256decrypt(edata, this.encryptionkey)
      this.data = JSON.parse(this.data)
    }
    return this.data
  }

  setData (data) {
    this.data = data
    return
  }

  getConnections() {    
    if (!this.connections) {
      const econnections = localStorage.getItem('connections')
      this.connections = Utils.aes256decrypt(econnections, this.encryptionkey)
      this.connections = JSON.parse(this.connections)
    }
    return this.connections
  }

  setConnections (connections, writeToStorage = true) {
    this.connections = connections

    if (writeToStorage) {
      const econnections = Utils.aes256encrypt(JSON.stringify(connections), this.encryptionkey)
      localStorage.setItem('connections', econnections)
    }
    return
  }

  getMamChannels() {    
    if (Utils.isEmptyObject(this.mamChannels)) {
      const eMamChannels = localStorage.getItem('mamChannels')
      this.mamChannels = Utils.aes256decrypt(eMamChannels, this.encryptionkey)
      this.mamChannels = JSON.parse(this.mamChannels)
    }
    return this.mamChannels
  }

  setMamChannels (mamChannels, writeToStorage = true) {
    this.mamChannels = mamChannels

    if (writeToStorage) {
      const eMamChannels = Utils.aes256encrypt(JSON.stringify(mamChannels), this.encryptionkey)
      localStorage.setItem('mamChannels', eMamChannels)
    }
    return
  }

  writeToStorage() {
    const edata = Utils.aes256encrypt(JSON.stringify(this.data), this.encryptionkey)
    localStorage.setItem('data', edata)
    const econnections = Utils.aes256encrypt(JSON.stringify(this.connections), this.encryptionkey)
    localStorage.setItem('connections', econnections)
    const eMamChannels = Utils.aes256encrypt(JSON.stringify(this.mamChannels), this.encryptionkey)
    localStorage.setItem('mamChannels', eMamChannels)
  }

  getSession() {
    const session = localStorage.getItem('session')
    return session
  }

  setSession(session) {
    localStorage.setItem('session', session)
  }

  deleteSession() {
    localStorage.removeItem('session')
  }

  getPasswordHash() {
    const hpsw = localStorage.getItem('hpsw')
    return hpsw
  }

  setPasswordHash(hash) {
    localStorage.setItem('hpsw', hash)
  }

  setOptions(options) {
    localStorage.setItem('options', JSON.stringify(options))
  }

  getOptions() {
    const options = JSON.parse(localStorage.getItem('options'))
    return options
  }
}

export default StorageController
