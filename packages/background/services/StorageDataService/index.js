// class used to encrypt the content of wallet data in order to make more difficult the decryption of the seed since is encrypted togheter with other data (ex name, address ecc)
// options, state, password hash and session(timestamp for checking the last login) are not encrypted
import Utils from '@pegasus/lib/utils'

class StorageDataService {
  constructor (encryptionkey) {
    this.encryptionkey = encryptionkey
    this.data = null
    this.connections = []

    const edata = localStorage.getItem('data')
    if (!edata)
      this.setData([])

    const econnections = localStorage.getItem('connections')
    if (!econnections)
      this.setConnections([])
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

  setConnections (connections) {
    this.connections = connections
    return
  }

  writeToStorage() {
    const edata = Utils.aes256encrypt(JSON.stringify(this.data), this.encryptionkey)
    localStorage.setItem('data', edata)
    const econnections = Utils.aes256encrypt(JSON.stringify(this.connections), this.encryptionkey)
    localStorage.setItem('connections', econnections)
  }
}

export default StorageDataService
