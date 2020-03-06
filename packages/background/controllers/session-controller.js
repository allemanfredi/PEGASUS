import { APP_STATE } from '@pegasus/utils/states'

class SessionController {
  constructor(options) {
    const {
      walletController,
      customizatorController,
      storageController
    } = options

    this.walletController = walletController
    this.storageController = storageController
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

    // requests queue not empty during an extension hard reload cause show confirm view with 0 request
    // since the requests are deleted during the hard rel
    if (
      currentState ===
        APP_STATE.WALLET_REQUEST_IN_QUEUE_WITH_USER_INTERACTION &&
      this.customizatorController.getRequests().length === 0 &&
      !this.password
    ) {
      this.walletController.setState(APP_STATE.WALLET_UNLOCKED)
      return
    }

    if (
      currentState === APP_STATE.WALLET_REQUEST_IN_QUEUE_WITH_USER_INTERACTION
    )
      return

    const password = this.walletController.getPassword()

    if (!password && !this.walletController.isWalletSetup()) {
      this.walletController.setState(APP_STATE.WALLET_NOT_INITIALIZED)
      this.storageController.lock()
      return
    }

    if (!password) {
      this.walletController.setState(APP_STATE.WALLET_LOCKED)
      return
    }

    if (this.session) {
      const date = new Date()
      const currentTime = date.getTime()
      if (currentTime - this.session > 300000) {
        //this.storageController.writeToStorage()
        this.storageController.lock()
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
      this.storageController.lock()
      this.walletController.setState(APP_STATE.WALLET_LOCKED)
      return
    }
  }

  deleteSession() {
    //this.storageController.writeToStorage()

    this.session = null
    this.walletController.setState(APP_STATE.WALLET_LOCKED)
    this.walletController.setPassword(false)
  }
}

export default SessionController
