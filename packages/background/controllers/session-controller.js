import { APP_STATE } from '@pegasus/utils/states'
import logger from '@pegasus/utils/logger'

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
  }

  checkSession() {
    const currentState = this.walletController.getState()

    const password = this.walletController.getPassword()

    if (!password && !this.walletController.isWalletSetup()) {
      this.walletController.setState(APP_STATE.WALLET_NOT_INITIALIZED)
      return
    }

    if (
      !password &&
      currentState !== APP_STATE.WALLET_RESTORE &&
      currentState !== APP_STATE.WALLET_NOT_INITIALIZED
    ) {
      logger.log(`(SessionController) Wallet locked`)
      return
    }

    const requests = this.customizatorController.getRequests()
    const requestWitUserInteraction = requests.filter(
      request => request.needUserInteraction
    )
    if (
      requestWitUserInteraction.length === 0 &&
      currentState === APP_STATE.WALLET_REQUEST_IN_QUEUE_WITH_USER_INTERACTION
    ) {
      logger.log(
        `(SessionController) found state = WALLET_REQUEST_IN_QUEUE_WITH_USER_INTERACTION with requests = 0 -> set to WALLET_UNLOCKED`
      )
      this.walletController.setState(APP_STATE.WALLET_UNLOCKED)
      return
    }

    if (this.session) {
      const date = new Date()
      const currentTime = date.getTime()
      if (currentTime - this.session > 300000) {
        this.stateStorageController.lock()
        if (currentState >= APP_STATE.WALLET_UNLOCKED) {
          this.walletController.setState(APP_STATE.WALLET_LOCKED)
          logger.log(
            `(SessionController) Session expired... Locking the wallet`
          )
        }
        return
      }
      logger.log(`(SessionController) Session still valid`)
      return
    } else {
      this.password = false
    }
  }

  deleteSession() {
    this.session = null
    this.walletController.lockWallet()
  }
}

export default SessionController
