import argon2 from 'argon2-browser'
import crypto from 'crypto'

class LoginPasswordController {
  constructor(configs) {
    const { stateStorageController } = configs

    this.stateStorageController = stateStorageController

    this.password = null
  }

  async storePassword(_password) {
    const result = await argon2.hash({
      pass: _password,
      salt: crypto.randomBytes(16),
      time: 9,
      mem: 8192,
      hashLen: 32,
      parallelism: 2,
      type: argon2.ArgonType.Argon2id,
      distPath: ''
    })

    this.password = _password
    this.stateStorageController.set('hpsw', result.encoded, true)
  }

  comparePassword(_password) {
    const encoded = this.stateStorageController.get('hpsw')

    return new Promise(resolve => {
      argon2
        .verify({
          pass: _password,
          encoded
        })
        .then(() => resolve(true))
        .catch(() => resolve(false))
    })
  }

  getPassword() {
    return this.password
  }

  setPassword(_password) {
    this.password = _password
  }
}

export default LoginPasswordController
