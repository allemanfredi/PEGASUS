import { composeAPI } from '@iota/core'
import { APP_STATE } from '@pegasus/utils/states'
import logger from '@pegasus/utils/logger'
import { REQUESTS_WITH_USER_INTERACTION } from '../lib/constants'
import { addChecksum } from '@iota/checksum'

class RequestsController {
  constructor(options) {
    const {
      connectorController,
      walletController,
      popupController,
      networkController,
      mamController,
      stateStorageController,
      updateBadge
    } = options

    this.connectorController = connectorController
    this.walletController = walletController
    this.popupController = popupController
    this.networkController = networkController
    this.mamController = mamController
    this.stateStorageController = stateStorageController

    this.updateBadge = updateBadge

    this.requests = []
  }

  setWalletController(_walletController) {
    this.walletController = _walletController
  }

  setNetworkController(_networkController) {
    this.networkController = _networkController
  }

  setNodeController(_networkController) {
    this.nodeController = _networkController
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
      `(RequestsController) New request ${_request.uuid} - ${_request.method} from ${_request.requestor.origin}`
    )

    const { method, uuid, args, push, requestor } = _request

    let connection = this.connectorController.getConnection(requestor.origin)

    const state = this.walletController.getState()

    // NOTE: connector disabled for internal requests
    if (!connection) {
      connection = {
        requestToConnect: false,
        enabled: requestor.hostname === 'pegasus',
        requestor
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

      if (requestor.tabId) this.popupController.openPopup()
    }

    if (state <= APP_STATE.WALLET_LOCKED || !connection.enabled) {
      logger.log(
        `(RequestsController) Pushing request ${uuid} - ${method} because of locked wallet`
      )

      this.requests = [
        {
          connection,
          method,
          uuid,
          push,
          args,
          needUserInteraction: REQUESTS_WITH_USER_INTERACTION.includes(method)
        },
        ...this.requests
      ]

      if (state <= APP_STATE.WALLET_LOCKED)
        this.walletController.setState(APP_STATE.WALLET_LOCKED)

      /* NOTE:
       *  not open popup if the real popup is already opened or
       *  the number of requests are greater than 1 in order
       *  to don't acquire the popup mutex, that in case of multy reject
       *  could be not released
       */
      if (requestor.tabId && this.requests.length === 1)
        this.popupController.openPopup()

      this.updateBadge()
    } else if (connection.enabled && state >= APP_STATE.WALLET_UNLOCKED) {
      if (REQUESTS_WITH_USER_INTERACTION.includes(method)) {
        logger.log(
          `(RequestsController) Pushing request ${uuid} - ${method} and asking for user permission`
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

        // NOTE: same thing above
        if (requestor.tabId && this.requests.length === 1)
          this.popupController.openPopup()

        this.walletController.setState(
          APP_STATE.WALLET_REQUEST_IN_QUEUE_WITH_USER_INTERACTION
        )

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

    this.stateStorageController.set('requests', this.requests)
  }

  async confirmRequest(_request) {
    const state = this.walletController.getState()
    if (state <= APP_STATE.WALLET_LOCKED) return

    const request = this.requests.find(request =>
      _request.uuid ? request.uuid === _request.uuid : false
    )

    /* NOTE:
     *  if someone is able to get access to trusted connection (ex: popup) and execute a
     *  a request directly, it MUST be rejected since has not passed through the connector
     */
    if (!request) {
      logger.log(`(RequestsController) request ${_request.uuid} not found.`)
      return
    }

    /*
     * NOTE:
     *  in order to prevent a possibility to change .enabled from external
     *  and then submit an confirmRequest
     */
    const origin = request.connection.requestor.origin
    const connection = this.connectorController.getConnection(origin)
    if (!connection) {
      logger.log(
        `(RequestsController) Impossible to execute a request with a not connected origin: ${origin}`
      )
      request.push({
        response: `(RequestsController) Impossible to execute a request with a not connected origin: ${origin}`,
        success: false,
        uuid: _request.uuid
      })
      return
    }

    logger.log(
      `(RequestsController) Executing request ${_request.uuid} - ${_request.method} ...`
    )

    if (connection.enabled && request.push) {
      const res = await this.execute(_request)

      request.push({
        response: res.response,
        success: res.success,
        uuid: _request.uuid
      })

      this.removeRequest(_request)

      logger.log(
        `(RequestsController) Request ${_request.uuid} - ${_request.method}  executed`
      )

      if (this.requests.length === 0) {
        this.walletController.setState(APP_STATE.WALLET_UNLOCKED)
        this.popupController.closePopup()
      }

      /* NOTE:
       *  "return res" used when request is executed from popup and
       *  background.confirmRequest need to know the result since a
       *  request is executed from a view different than confirmRequest
       */
      return res
    } else if (!connection.enabled && request.push) {
      logger.log(
        `(RequestsController) Rejecting request ${_request.uuid} - ${_request.method} because of no granted permission`
      )

      request.push({
        response: 'No granted permissions',
        success: false,
        uuid: _request.uuid
      })

      this.removeRequest(_request)

      if (this.requests.length === 0)
        this.walletController.setState(APP_STATE.WALLET_UNLOCKED)
    }
    return
  }

  rejectRequest(_request) {
    const request = this.requests.find(
      request => request.uuid === _request.uuid
    )

    logger.log(
      `(RequestsController) Rejecting (singular) request ${_request.uuid} - ${_request.method}`
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
        `(RequestsController) Rejecting (All) request ${request.uuid} - ${request.method}`
      )

      this.removeRequest(request)
    })
    this.popupController.closePopup()
    this.walletController.setState(APP_STATE.WALLET_UNLOCKED)
  }

  execute(_request) {
    const { method, args } = _request

    // NOTE: if it's a request handling by the nodeController
    const iota = composeAPI()
    if (iota[method] || method === 'transfer') {
      return new Promise(resolve => {
        this.nodeController
          .execute(method, args)
          .then(response =>
            resolve({
              response,
              success: true
            })
          )
          .catch(err =>
            resolve({
              response: err.message,
              success: false
            })
          )
      })
    }

    switch (method) {
      case 'getCurrentAccount': {
        const account = this.walletController.getCurrentAccount()
        return new Promise(resolve =>
          resolve({
            response: addChecksum(account.data.latestAddress),
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
    }
  }

  removeRequest(_request) {
    logger.log(
      `(RequestsController) Removing request ${_request.uuid} - ${_request.method}`
    )

    this.requests = this.requests.filter(
      request => request.uuid !== _request.uuid
    )

    this.updateBadge()

    this.stateStorageController.set('requests', this.requests)
  }
}

export default RequestsController
