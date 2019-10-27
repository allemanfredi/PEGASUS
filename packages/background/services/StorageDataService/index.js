// class used to encrypt the content of wallet data in order to make more difficult the decryption of the seed since is encrypted togheter with other data (ex name, address ecc)
// options, state, password hash and session(timestamp for checking the last login) are not encrypted
import Utils from '@pegasus/lib/utils'

class StorageDataService {
  constructor (encryptionkey) {
    this.encryptionkey = encryptionkey
    this.data = null
    this.connection = null

    const edata = localStorage.getItem('data')
    if (!edata)
      this.setData([])

    const econnection = localStorage.getItem('connection')
    if (!econnection)
      this.setConnection({
        requestToConnect: true,
        connected: false,
        enabled: false
      })
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

  getConnection() {    
    if (!this.connection) {
      const econnection = localStorage.getItem('connection')
      this.connection = Utils.aes256decrypt(econnection, this.encryptionkey)
      this.data = JSON.parse(this.connection)
    }
    return this.connection
  }

  setConnection (connection) {
    this.connection = connection
    return
  }

  writeToStorage() {
    const edata = Utils.aes256encrypt(JSON.stringify(this.data), this.encryptionkey)
    localStorage.setItem('data', edata)
    const econnection = Utils.aes256encrypt(JSON.stringify(this.connection), this.encryptionkey)
    localStorage.setItem('connection', econnection)
  }
}

export default StorageDataService
