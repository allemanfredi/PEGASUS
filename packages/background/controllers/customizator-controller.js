import { composeAPI } from '@iota/core'
import { APP_STATE } from '@pegasus/utils/states'
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
      mamController,
      updateBadge
    } = options

    this.connectorController = connectorController
    this.walletController = walletController
    this.popupController = popupController
    this.networkController = networkController
    this.mamController = mamController
    
    this.updateBadge = updateBadge

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

  getExecutableRequests(_origin, _tabId) {
    return this.requests.filter(
      request =>
        request.connection.enabled &&
        request.connection.website.origin === _origin &&
        request.connection.website.tabId === _tabId
    )
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
      this.connectorController.pushConnectionRequest(
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

      this.updateBadge()
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

        this.updateBadge()
      } else {
        const res = await this.execute(_request)

        _request.push({
          response: res.response,
          success: res.success,
          uuid
        })

        this.removeRequest(_request)
      }
    }
  }

  async executeRequest(_request) {
    const request = this.requests.find(request =>
      _request.uuid ? request.uuid === _request.uuid : false
    )

    //request from popup request = null since it was put directly
    if (_request.connection.enabled && !request) {
      const res = await this.execute(_request)

      logger.log(
        `(CustomizatorController) Executed request ${_request.method} from popup`
      )
      return res
    } else if (_request.connection.enabled && request.push) {
      const res = await this.execute(_request)

      request.push({
        response: res.response,
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
    } else if (!_request.connection.enabled && request.push) {
      logger.log(
        `(CustomizatorController) Rejecting request ${_request.uuid} - ${_request.method} because of no granted permission`
      )

      request.push({
        response: 'No granted permissions',
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
    const request = this.requests.find(
      request => request.uuid === _request.uuid
    )

    const res = await this.execute(_request)

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

    request.push({
      success: res.success,
      response: res.response,
      uuid: _request.uuid
    })

    return res
  }

  rejectRequest(_request) {
    const request = this.requests.find(
      request => request.uuid === _request.uuid
    )

    logger.log(
      `(CustomizatorController) Rejecting (singular) request ${_request.uuid} - ${_request.method}`
    )

    request.push({
      response: 'Request has been rejected by the user',
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
        response: 'Request has been rejected by the user',
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
          .then(response =>
            resolve({
              response,
              success: true
            })
          )
          .catch(err =>
            resolve({
              response: err,
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
        return new Promise(resolve =>
          resolve({
            response: account.data.latestAddress,
            success: true
          })
        )
      }
      case 'getCurrentProvider': {
        const network = this.networkController.getCurrentNetwork()
        return new Promise(resolve =>
          resolve({
            response: network.provider,
            success: true
          })
        )
      }
      case 'mam_init': {
        const res = this.mamController.init(...args)
        return new Promise(resolve => resolve(res))
      }
      case 'mam_changeMode': {
        const res = this.mamController.changeMode(...args)
        return new Promise(resolve => resolve(res))
      }
      case 'mam_getRoot': {
        const res = this.mamController.getRoot(...args)
        return new Promise(resolve => resolve(res))
      }
      case 'mam_create': {
        const res = this.mamController.create(...args)
        return new Promise(resolve => resolve(res))
      }
      case 'mam_decode': {
        const res = this.mamController.decode(...args)
        return new Promise(resolve => resolve(res))
      }
      case 'mam_attach': {
        return this.mamController.attach(...args)
      }
      case 'mam_fetch': {
        return this.mamController.fetch(...args)
      }
      case 'mam_fetchSingle': {
        return this.mamController.fetchSingle(...args)
      }
      default: {
        return {
          response: 'Method Not Found',
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

    this.updateBadge()
  }
}

export default CustomizatorController
