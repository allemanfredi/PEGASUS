class LoginPasswordController {
  constructor(configs) {
    const { stateStorageController } = configs

    this.stateStorageController = stateStorageController

    this.password = null
  }

  isUnlocked() {
    return Boolean(this.password)
  }

  getPassword() {
    return this.password
  }

  setPassword(_password) {
    this.password = _password
  }
}

export default LoginPasswordController
