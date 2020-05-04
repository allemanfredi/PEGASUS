import { APP_STATE } from '@pegasus/utils/states'
import logger from '@pegasus/utils/logger'
import { normalizeConnectionRequests } from '../lib/connection-requests'
import { composeAPI } from '@iota/core'
import { REQUESTS_WITH_USER_INTERACTION } from '../lib/constants'
import { addChecksum } from '@iota/checksum'

class PegasusWallController {
  constructor(configs) {
    const {
      popupController,
      stateStorageController,
      walletController,
      nodeController,
      updateBadge
    } = configs

    this.popupController = popupController
    this.stateStorageController = stateStorageController
    this.walletController = walletController
    this.nodeController = nodeController

    this.connections = {}
    this.connectionRequests = {}
    this.websiteMetadata = {}
    this.requests = []

    this.updateBadge = updateBadge
  }

  /**
   *
   * Check if a given origin is connected
   *
   * @param {String} _origin
   */
  isConnected(_origin) {
    return Boolean(
      this.connections[_origin] && this.connections[_origin].enabled
    )
  }

  /**
   *
   * Adds a pending connection used by RequestsController
   * whem user try to call a function from the content script
   * without having estabilished the connection
   *
   * @param {Object} _connection
   */
  pushConnectionRequest(_connection) {
    const { requestor } = _connection

    if (!this.connectionRequests[requestor.origin])
      this.connectionRequests[requestor.origin] = {}

    this.connectionRequests[requestor.origin][requestor.tabId] = _connection

    //NOTE: attach metadata
    this.connectionRequests[requestor.origin][requestor.tabId].requestor = {
      ...this.connectionRequests[requestor.origin][requestor.tabId].requestor,
      ...this.websiteMetadata[requestor.origin]
    }

    this.stateStorageController.set(
      'connectionRequests',
      normalizeConnectionRequests(this.connectionRequests)
    )

    this.updateBadge()

    this.walletController.setState(
      APP_STATE.WALLET_REQUEST_PERMISSION_OF_CONNECTION
    )
  }

  /**
   * Get all website connections
   */
  getConnections() {
    return this.connections
  }

  /**
   *
   * Get a connection given the origin
   *
   * @param {String} _origin
   */
  getConnection(_origin) {
    return this.connections[_origin]
  }

  /**
   * Get all pending connection to be confirmed
   */
  getConnectionRequests() {
    return normalizeConnectionRequests(this.connectionRequests)
  }

  /**
   *
   * Function called directly from the content script with .connect
   *
   * @param {String} _uuid
   * @param {Function} _push
   * @param {Object} _requestor
   */
  connect(_uuid, _push, _requestor) {
    this.pushConnectionRequest({
      requestor: _requestor,
      requestToConnect: true,
      enabled: false,
      push: _push,
      uuid: _uuid
    })

    logger.log(
      `(PegasusWallController) New _connect request with ${_requestor.origin}`
    )

    this.walletController.setState(
      APP_STATE.WALLET_REQUEST_PERMISSION_OF_CONNECTION
    )

    this.popupController.openPopup()
  }

  /**
   *
   * Complete a connection after the user confirmation
   * in the popup
   *
   * @param {String} _origin
   * @param {Number} _tabId
   */
  completeConnectionRequest(_origin, _tabId) {
    logger.log(
      `(PegasusWallController) Completing connection with ${_origin} - ${_tabId}`
    )

    if (this.connectionRequests[_origin][_tabId].push) {
      this.connectionRequests[_origin][_tabId].push({
        response: true,
        success: true,
        uuid: this.connectionRequests[_origin][_tabId].uuid
      })
    }

    this.connections[_origin] = Object.assign(
      {},
      this.connectionRequests[_origin][_tabId],
      {
        enabled: true
      }
    )

    // NOTE: tabId not nedeed to check if a connection with an origin is enabled
    delete this.connections[_origin].tabId

    const requestWithUserInteraction = this.requests.filter(
      request => request.needUserInteraction
    )

    this.requests.forEach(request => {
      if (request.connection.requestor.origin === _origin) {
        request.connection.requestToConnect = false
        request.connection.enabled = true

        if (!request.needUserInteraction) this.confirmRequest(request)
      }
    })

    this.removeConnectionRequest(_origin, _tabId)

    if (
      requestWithUserInteraction.length === 0 &&
      Object.values(this.connectionRequests).length === 0
    ) {
      this.popupController.closePopup()
      this.walletController.setState(APP_STATE.WALLET_UNLOCKED)
    }

    const account = this.walletController.getCurrentAccount()
    const network = this.walletController.getCurrentNetwork()
    this.walletController.emit(
      'accountChanged',
      account.data[network.type].latestAddress
    )

    return true
  }

  /**
   *
   * Rejects a pending connection from the popup
   *
   * @param {String} _origin
   * @param {Integer} _tabId
   */
  rejectConnectionRequest(_origin, _tabId) {
    //const requests = this.getRequests()

    logger.log(`(PegasusWallController) Rejecting connection with ${_origin}`)

    // NOTE: if it's a connect request from tab
    if (this.connectionRequests[_origin][_tabId].push) {
      this.connectionRequests[_origin][_tabId].push({
        response: false,
        success: true,
        uuid: this.connectionRequests[_origin][_tabId].uuid
      })
    }

    this.requests.forEach(request => {
      if (request.connection.requestor.origin === _origin)
        this.removeRequest(request)
    })

    this.removeConnectionRequest(_origin, _tabId)
    this.removeConnection(_origin)

    if (Object.values(this.connectionRequests).length === 0) {
      this.popupController.closePopup()
      this.walletController.setState(APP_STATE.WALLET_UNLOCKED)
    }

    return true
  }

  /**
   *
   * Function used to estabilish a connection with a website,
   *
   * @param {Object} _requestor
   */
  estabilishConnection(_requestor) {
    // NOTE: pegasus wall not enabled for internal processes
    if (_requestor.hostname === 'pegasus') {
      logger.log(
        '(PegasusWallController) Internal process asked to connect -> Connected'
      )
      this.connections[_requestor.origin] = {
        requestor: _requestor,
        requestToConnect: false,
        enabled: true
      }
      return
    }

    logger.log(
      `(PegasusWallController) Estabilishing connection with ${_requestor.origin}`
    )

    const account = this.walletController.getCurrentAccount()
    const state = this.walletController.getState()

    if (this.connections[_requestor.origin]) {
      if (
        this.connections[_requestor.origin].enabled &&
        state >= APP_STATE.WALLET_UNLOCKED
      ) {
        logger.log(
          `(PegasusWallController) Connection with ${_requestor.origin} already enabled`
        )
        return account.data.latestAddress
      }
    }

    this.connections[_requestor.origin] = {
      requestor: _requestor,
      requestToConnect: false,
      enabled: false
    }

    return null
  }

  /**
   *
   * Remove an estabilished connection with a website
   *
   * @param {String} _origin
   */
  removeConnection(_origin) {
    logger.log(`(PegasusWallController) Removing connection with ${_origin}`)
    delete this.connections[_origin]
    return true
  }

  /**
   *
   * Remove a pending connection with a website and its relative
   * website metadata
   *
   * @param {String} _origin
   */
  removePendingConnection(_origin) {
    if (this.connections[_origin] && !this.connections[_origin].enabled) {
      logger.log(
        `(PegasusWallController) Removing pending connection with ${_origin}`
      )
      delete this.connections[_origin]
      delete this.websiteMetadata[_origin]
    }
    return true
  }

  /**
   *
   * Remove a pending connection and update the badge
   *
   * @param {String} _origin
   * @param {Number} _tabId
   */
  removeConnectionRequest(_origin, _tabId) {
    delete this.connectionRequests[_origin][_tabId]

    if (Object.values(this.connectionRequests[_origin]).length === 0)
      delete this.connectionRequests[_origin]

    this.updateBadge()
    this.stateStorageController.set(
      'connectionRequests',
      normalizeConnectionRequests(this.connectionRequests)
    )
  }

  /**
   *
   * Add a connection with a website
   *
   * @param {Object} _connection
   */
  addConnection(_connection) {
    logger.log(
      `(PegasusWallController) Add connection with ${_connection.requestor.origin}`
    )
    if (this.connections[_connection.requestor.origin]) return false

    this.connections[_connection.requestor.origin] = _connection
    return true
  }

  /**
   *
   * Attach metadata to pending and estabilished connection
   *
   * @param {String} _origin
   * @param {Object} _metadata
   */
  attachMetadata(_origin, _metadata) {
    logger.log(`(PegasusWallController) Attacching ${_origin} metadata`)

    this.websiteMetadata[_origin] = _metadata

    if (this.connections[_origin]) {
      this.connections[_origin].requestor = {
        ...this.connections[_origin].requestor,
        ..._metadata
      }
    }
  }

  /**
   *
   * Set requests
   *
   * @param {Array} _requests
   */
  setRequests(_requests) {
    this.requests = _requests
  }

  /**
   *
   * Get all current requests
   */
  getRequests() {
    return this.requests
  }

  /**
   *
   * Get all approved requests
   */
  getExecutableRequests() {
    return this.requests.filter(request => request.connection.enabled)
  }

  /**
   *
   * Push into request queue a new one. Pegasus
   * MUST be unlocked and the connection with the
   * corresponding website must be done. If NOT, this
   * method will call the Connector wich will redirect
   * the user in the popup Connection view
   *
   * @param {Object} _request
   */
  async pushRequest(_request) {
    logger.log(
      `(RequestsController) New request ${_request.uuid} - ${_request.method} from ${_request.requestor.origin}`
    )

    const { method, uuid, args, push, requestor } = _request

    let connection = this.getConnection(requestor.origin)

    const state = this.walletController.getState()

    // NOTE: pegasus wall disabled for internal requests
    if (!connection) {
      connection = {
        requestToConnect: false,
        enabled: requestor.hostname === 'pegasus',
        requestor
      }
    }

    if (!connection.requestToConnect && !connection.enabled) {
      this.pushConnectionRequest(
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

      if (requestor.tabId) this.popupController.openPopup()

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

        if (requestor.tabId) this.popupController.openPopup()

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

  /**
   *
   * Confirm a request. In order to be confirmable,
   * the connection with this website must be granted.
   * A request, in order to be executable must pass
   * within the pegasus wall
   *
   * @param {Object} _request
   */
  async confirmRequest(_request) {
    const state = this.walletController.getState()
    if (state <= APP_STATE.WALLET_LOCKED) return

    const request = this.requests.find(request =>
      _request.uuid ? request.uuid === _request.uuid : false
    )

    /* NOTE:
     *  if someone is able to get access to trusted connection (ex: popup) and execute a
     *  a request directly, it MUST be rejected since has not passed through the pegasus wall
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
    const connection = this.getConnection(origin)
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

  /**
   *
   * Reject a single pendind request
   *
   * @param {Object} _request
   */
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

  /**
   *
   * Reject all pending requests
   */
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

  /**
   *
   * Execute a request. This method is not exposed
   * into the public API
   *
   * @param {Object} _request
   */
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
        const network = this.walletController.getCurrentNetwork()
        return new Promise(resolve =>
          resolve({
            response: addChecksum(account.data[network.type].latestAddress),
            success: true
          })
        )
      }
      case 'getCurrentProvider': {
        const network = this.walletController.getCurrentNetwork()
        return new Promise(resolve =>
          resolve({
            response: network.provider,
            success: true
          })
        )
      }
    }
  }

  /**
   *
   * Remove a request and update the
   * exstension badge
   *
   * @param {Object} _request
   */
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

export default PegasusWallController
