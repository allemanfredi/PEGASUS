import { APP_STATE } from '@pegasus/utils/states'
import logger from '@pegasus/utils/logger'

const SESSION_TIME_CHECK = 30000
const MAX_TIME_INACTIVE = 3.6e6 // 1 hour

class SessionController {
  constructor(options) {
    const {
      walletController,
      customizatorController,
      stateStorageController,
      loginPasswordController
    } = options

    this.walletController = walletController
    this.stateStorageController = stateStorageController
    this.customizatorController = customizatorController
    this.loginPasswordController = loginPasswordController

    this.session = null
  }

  startSession() {
    const date = new Date()
    this.session = date.getTime()
    this.sessionInterval = setInterval(
      () => this.checkSession(),
      SESSION_TIME_CHECK
    )
  }

  checkSession() {
    const currentState = this.walletController.getState()

    const password = this.loginPasswordController.getPassword()

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

      const { autoLocking } = this.walletController.getPopupSettings()

      // NOTE: if auto locking is enabled check the session
      if (autoLocking.enabled) {
        logger.log(
          `(SessionController) Auto locking is enabled with time: ${autoLocking.time} minutes, checking...`
        )

        if (currentTime - this.session > autoLocking.time * 60 * 1000) {
          if (currentState >= APP_STATE.WALLET_UNLOCKED) {
            this.walletController.lockWallet()
            logger.log(
              `(SessionController) Session expired... Locking the wallet`
            )
          }
          return
        }
      }
    } else {
      this.password = false
    }
  }

  deleteSession() {
    this.session = null
    clearInterval(this.sessionInterval)
  }
}

export default SessionController
