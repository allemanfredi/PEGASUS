import { composeAPI } from '@iota/core'
import { APP_STATE } from '@pegasus/utils/states'

import extensionizer from 'extensionizer'
import logger from '@pegasus/utils/logger'

const requestsWithUserInteraction = [
  'mam_init',
  'mam_changeMode',
  'prepareTransfers'
]

class CustomizatorController {
  constructor(options) {
    const {
      connectorController,
      walletController,
      popupController,
      networkController,
      mamController
    } = options

    this.connectorController = connectorController
    this.walletController = walletController
    this.popupController = popupController
    this.networkController = networkController
    this.mamController = mamController

    this.requests = []
  }

  setWalletController(_walletController) {
    this.walletController = _walletController
  }

  setNetworkController(_networkController) {
    this.networkController = _networkController
  }

  setTransferController(_networkController) {
    this.transferController = _networkController
  }

  setRequests(_requests) {
    this.requests = _requests
  }

  getRequests() {
    return this.requests
  }

  getExecutableRequests() {
    return this.requests.filter(request => request.connection.enabled)
  }

  async pushRequest(_request) {
    logger.log(
      `(CustomizatorController) New request ${_request.uuid} - ${_request.method} from ${_request.website.origin}`
    )

    const { method, uuid, args, push, website } = _request

    let connection = this.connectorController.getConnection(website.origin)
    let isPopupAlreadyOpened = false

    const popup = this.popupController.getPopup()
    const state = this.walletController.getState()

    if (!connection) {
      connection = {
        requestToConnect: false,
        enabled: false,
        website
      }
    }

    if (!connection.requestToConnect && !connection.enabled) {
      this.connectorController.setConnectionRequest(
        Object.assign({}, connection, {
          requestToConnect: true
        })
      )

      this.walletController.setState(
        APP_STATE.WALLET_REQUEST_PERMISSION_OF_CONNECTION
      )

      if (!popup) {
        this.popupController.openPopup()
        isPopupAlreadyOpened = true
      }
    }

    if (state <= APP_STATE.WALLET_LOCKED || !connection.enabled) {
      if (!popup && isPopupAlreadyOpened === false) {
        this.popupController.openPopup()
      }

      logger.log(
        `(CustomizatorController) Pushing request ${uuid} - ${method} because of locked wallet`
      )

      this.requests = [
        {
          connection,
          method,
          uuid,
          push,
          args,
          needUserInteraction: requestsWithUserInteraction.includes(method)
        },
        ...this.requests
      ]

      if (state <= APP_STATE.WALLET_LOCKED) {
        this.walletController.setState(APP_STATE.WALLET_LOCKED)
      }

      extensionizer.browserAction.setBadgeText({
        text: this.requests.length.toString()
      })
    } else if (connection.enabled && state >= APP_STATE.WALLET_UNLOCKED) {
      if (requestsWithUserInteraction.includes(method)) {
        logger.log(
          `(CustomizatorController) Pushing request ${uuid} - ${method} and asking for user permission`
        )

        this.requests = [
          {
            connection,
            method,
            uuid,
            push,
            args,
            needUserInteraction: true
          },
          ...this.requests
        ]
        this.popupController.openPopup()

        extensionizer.browserAction.setBadgeText({
          text: this.requests.length.toString()
        })

        //this.setRequests(this.requests)
      } else {
        const res = await this.execute(_request)

        _request.push({
          data: res.success ? res.data : res.error,
          success: res.success,
          uuid
        })

        this.removeRequest(_request)
      }
    }
  }

  async executeRequest(_request) {
    //needed because request handler remove push/reject
    const request = this.requests.find(request =>
      _request.uuid ? request.uuid === _request.uuid : false
    )
    
    if (_request.connection.enabled && !_request.push) {
      const res = await this.execute(_request)

      logger.log(
        `(CustomizatorController) Executed request ${_request.uuid} - ${_request.method} from popup`
      )
      return res
    }

    if (_request.connection.enabled && _request.push) {
      const res = await this.execute(_request)

      console.log(_request.push)
      console.log(request.push)

      _request.push({
        data: res.success ? res.data : res.error,
        success: res.success,
        uuid: _request.uuid
      })

      this.removeRequest(_request)

      logger.log(
        `(CustomizatorController) Executed request ${_request.uuid} - ${_request.method} from tab`
      )

      if (this.requests.length === 0) {
        this.walletController.setState(APP_STATE.WALLET_UNLOCKED)
        this.popupController.closePopup()
      }

      return res
    } else if (!_request.connection.enabled && _request.push) {
      logger.log(
        `(CustomizatorController) Rejecting request ${_request.uuid} - ${_request.method} because of no granted permission`
      )

      _request.push({
        data: 'No granted permissions',
        success: false,
        uuid: _request.uuid
      })

      this.removeRequest(_request)

      if (this.requests.length === 0) {
        this.walletController.setState(APP_STATE.WALLET_UNLOCKED)
      }
    }
    return
  }

  async confirmRequest(_request) {
    //needed because request handler remove push/reject
    /*const request = this.requests.find(
      request => request.uuid === _request.uuid
    )*/

    const { uuid, push } = _request

    const res = await this.execute(_request)

    if (res.tryAgain) return

    if (this.requests.length === 1) {
      logger.log(`(CustomizatorController) Last request to execute`)
      this.walletController.setState(APP_STATE.WALLET_UNLOCKED)
    }

    this.removeRequest(_request)

    if (this.requests.length === 0) {
      this.popupController.closePopup()
      this.walletController.setState(APP_STATE.WALLET_UNLOCKED)
    } else {
      //this.setRequests(this.requests)
      //this.walletController.setState(APP_STATE.WALLET_REQUEST_IN_QUEUE_WITH_USER_INTERACTION)
    }

    push({
      data: res.success ? res.data : res.error,
      success: res.success,
      uuid
    })
  }

  rejectRequest(_request) {
    //needed because request handler remove push/reject
    /*const request = this.requests.find(
      request => request.uuid === _request.uuid
    )*/

    logger.log(
      `(CustomizatorController) Rejecting (singular) request ${_request.uuid} - ${_request.method}`
    )

    _request.push({
      data: 'Request has been rejected by the user',
      success: false,
      uuid: _request.uuid
    })

    this.removeRequest(_request)

    if (this.requests.length === 0) {
      this.popupController.closePopup()
      this.walletController.setState(APP_STATE.WALLET_UNLOCKED)
    } else {
      //this.setRequests(this.requests)
    }
  }

  rejectRequests() {
    this.requests.forEach(request => {
      request.push({
        data: 'Request has been rejected by the user',
        success: false,
        uuid: request.uuid
      })

      logger.log(
        `(CustomizatorController) Rejecting (All) request ${request.uuid} - ${request.method}`
      )

      this.removeRequest(request)
    })
    this.requests = []
    this.popupController.closePopup()
    this.walletController.setState(APP_STATE.WALLET_UNLOCKED)
  }

  async execute(_request) {
    const { method, args } = _request

    const network = this.networkController.getCurrentNetwork()
    const iota = composeAPI({ provider: network.provider })

    if (method !== 'prepareTransfers' && iota[method]) {
      return new Promise(resolve => {
        iota[method](...args)
          .then(data =>
            resolve({
              data,
              success: true
            })
          )
          .catch(err =>
            resolve({
              data: err,
              success: false
            })
          )
      })
    }

    switch (method) {
      case 'prepareTransfers': {
        return this.transferController.confirmTransfers(...args)
      }
      case 'getCurrentAccount': {
        const account = this.walletController.getCurrentAccount()
        return new Promise(push =>
          push({
            data: account.data.latestAddress,
            success: true
          })
        )
      }
      case 'getCurrentProvider': {
        const network = this.networkController.getCurrentNetwork()
        return new Promise(resolve =>
          resolve({
            data: network.provider,
            success: true
          })
        )
      }
      case 'mam_init': {
        const res = this.mamController.init(...data.args)
        return new Promise(resolve => resolve(res))
      }
      case 'mam_changeMode': {
        const res = this.mamController.changeMode(...data.args)
        return new Promise(resolve => resolve(res))
      }
      case 'mam_getRoot': {
        const res = this.mamController.getRoot(...data.args)
        return new Promise(resolve => resolve(res))
      }
      case 'mam_create': {
        const res = this.mamController.create(...data.args)
        return new Promise(resolve => resolve(res))
      }
      case 'mam_decode': {
        const res = this.mamController.decode(...data.args)
        return new Promise(resolve => resolve(res))
      }
      case 'mam_attach': {
        return this.mamController.attach(...data.args)
      }
      case 'mam_fetch': {
        return this.mamController.fetch(...data.args)
      }
      case 'mam_fetchSingle': {
        return this.mamController.fetchSingle(...data.args)
      }
      default: {
        return {
          error: 'Method Not Found',
          success: false
        }
      }
    }
  }

  removeRequest(_request) {
    logger.log(
      `(CustomizatorController) Removing request ${_request.uuid} - ${_request.method}`
    )

    this.requests = this.requests.filter(
      request => request.uuid !== _request.uuid
    )

    extensionizer.browserAction.setBadgeText({
      text: this.requests.length !== 0 ? this.requests.length.toString() : ''
    })
  }
}

export default CustomizatorController
