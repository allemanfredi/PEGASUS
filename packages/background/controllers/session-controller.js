import { APP_STATE } from '@pegasus/utils/states'

class SessionController {
  constructor(options) {
    const {
      walletController,
      customizatorController,
      stateStorageController
    } = options

    this.walletController = walletController
    this.stateStorageController = stateStorageController
    this.customizatorController = customizatorController

    this.session = null
  }

  startSession() {
    const date = new Date()
    this.session = date.getTime()
    this.walletController.setState(APP_STATE.WALLET_UNLOCKED)
  }

  checkSession() {
    const currentState = this.walletController.getState()

    const password = this.walletController.getPassword()
    if (
      !password
    ) {
      this.walletController.setState(APP_STATE.WALLET_LOCKED)
      return
    }

    if (
      currentState === APP_STATE.WALLET_REQUEST_IN_QUEUE_WITH_USER_INTERACTION ||
      currentState === APP_STATE.WALLET_REQUEST_PERMISSION_OF_CONNECTION
    )
      return

    if (!password && !this.walletController.isWalletSetup()) {
      this.walletController.setState(APP_STATE.WALLET_NOT_INITIALIZED)
      this.stateStorageController.lock()
      return
    }

    if (this.session) {
      const date = new Date()
      const currentTime = date.getTime()
      if (currentTime - this.session > 300000) {
        this.stateStorageController.lock()
        this.walletController.setState(APP_STATE.WALLET_LOCKED)
        return
      }
      this.walletController.setState(APP_STATE.WALLET_UNLOCKED)
      return
    } else {
      this.password = false
    }

    if (currentState <= APP_STATE.WALLET_INITIALIZED) {
      return
    } else {
      this.stateStorageController.lock()
      this.walletController.setState(APP_STATE.WALLET_LOCKED)
      return
    }
  }

  deleteSession() {
    this.session = null
    this.walletController.setState(APP_STATE.WALLET_LOCKED)
    this.walletController.setPassword(false)
  }
}

export default SessionController
