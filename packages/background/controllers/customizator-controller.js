import { composeAPI } from '@iota/core'
import { APP_STATE } from '@pegasus/utils/states'
import { backgroundMessanger } from '@pegasus/utils/messangers'

class CustomizatorController {
  constructor(options, provider) {
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

    if (provider) this.iota = composeAPI({ provider })
  }

  setRequests(requests) {
    this.requests = requests
  }

  getRequests() {
    return this.requests
  }

  getRequestsWithUserInteraction() {
    return this.requests.filter(request => request.needUserInteraction === true)
  }

  setProvider(provider) {
    this.iota = composeAPI({ provider })
  }

  setWalletController(walletController) {
    this.walletController = walletController
  }

  setNetworkController(networkController) {
    this.networkController = networkController
  }

  setTransferController(transferController) {
    this.transferController = transferController
  }

  async pushRequest(request) {
    const account = this.walletController.getCurrentAccount()

    const { method, uuid, resolve, data, website } = request

    const connection = this.connectorController.getConnection(
      website.origin,
      account ? account.id : null
    )
    let mockConnection = connection
    let isPopupAlreadyOpened = false

    const requestsWithUserInteraction = [
      'mam_init',
      'mam_changeMode',
      'prepareTransfers'
    ]

    const popup = this.popupController.getPopup()

    if (!connection) {
      this.walletController.setState(
        APP_STATE.WALLET_REQUEST_PERMISSION_OF_CONNECTION
      )
      this.popupController.openPopup()
      mockConnection = {
        website,
        requestToConnect: true,
        connected: false,
        enabled: false,
        accountId: account ? account.id : null
      }
      this.connectorController.setConnectionToStore(connection)
      isPopupAlreadyOpened = true
    } else if (!connection.enabled) {
      this.walletController.setState(
        APP_STATE.WALLET_REQUEST_PERMISSION_OF_CONNECTION
      )

      if (!popup) {
        this.popupController.openPopup()
      }

      isPopupAlreadyOpened = true
    }

    const state = this.walletController.getState()

    if (
      state <= APP_STATE.WALLET_LOCKED ||
      !connection ||
      !connection.enabled
    ) {
      if (!popup && isPopupAlreadyOpened === false) {
        this.popupController.openPopup()
      }

      this.requests = [
        {
          connection: mockConnection,
          method,
          uuid,
          resolve,
          data,
          needUserInteraction: requestsWithUserInteraction.includes(method)
        },
        ...this.requests
      ]
    } else if (connection.enabled && state >= APP_STATE.WALLET_UNLOCKED) {
      if (requestsWithUserInteraction.includes(method)) {
        this.requests = [
          {
            connection,
            method,
            uuid,
            resolve,
            data,
            needUserInteraction: true
          },
          ...this.requests
        ]
        this.popupController.openPopup()

        backgroundMessanger.setRequests(this.requests)
      } else {
        const res = await this.execute({ method, uuid, resolve, data })
        this._removeRequest({ method, uuid, resolve, data })

        resolve({
          data: res.success ? res.data : res.error,
          success: res.success,
          uuid
        })
      }
    }
  }

  async executeRequestFromPopup(request) {
    return this.execute(request)
  }

  //request that does not need of popup interaction (ex: getCurrentAccount)
  executeRequests() {
    const account = this.walletController.getCurrentAccount()

    this.requests
      .filter(req => req.needUserInteraction !== true)
      .forEach(async request => {
        if (
          request.connection.enabled &&
          request.connection.accountId === account.id
        ) {
          const { resolve, uuid } = request

          const res = await this.execute(request)
          this._removeRequest(request)

          resolve({
            data: res.success ? res.data : res.error,
            success: res.success,
            uuid
          })
        } else {
          request.resolve({
            data: 'No granted permissions',
            success: false,
            uuid: request.uuid
          })
        }
      })
  }

  async confirmRequest(request) {
    const requestToExecute = this.requests.find(
      req => req.uuid === request.uuid
    )

    const { uuid, resolve } = requestToExecute

    const res = await this.execute(requestToExecute)

    if (res.tryAgain) return

    this._removeRequest(request)

    if (this.requests.length === 0) {
      this.popupController.closePopup()
      backgroundMessanger.setAppState(APP_STATE.WALLET_UNLOCKED)
    } else {
      backgroundMessanger.setRequests(this.requests)
    }

    resolve({
      data: res.success ? res.data : res.error,
      success: res.success,
      uuid
    })
  }

  rejectRequest(request) {
    const requestToReject = this.requests.find(req => req.uuid === request.uuid)

    requestToReject.resolve({
      data: 'Request has been rejected by the user',
      success: false,
      uuid: requestToReject.uuid
    })

    this._removeRequest(request)

    if (this.requests.length === 0) {
      this.popupController.closePopup()
      backgroundMessanger.setAppState(APP_STATE.WALLET_UNLOCKED)
    } else {
      backgroundMessanger.setRequests(this.requests)
    }
  }

  rejectRequests() {
    this.requests.forEach(request => {
      request.resolve({
        data: 'Request has been rejected by the user',
        success: false,
        uuid: request.uuid
      })
    })
    this.requests = []
    this.popupController.closePopup()
    backgroundMessanger.setAppState(APP_STATE.WALLET_UNLOCKED)
  }

  async execute(request) {
    const { method, data } = request

    const network = this.networkController.getCurrentNetwork()
    const iota = composeAPI({ provider: network.provider })

    if (method !== 'prepareTransfers' && iota[method]) {
      return new Promise(resolve => {
        iota[method](...data.args)
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
        return this.transferController.confirmTransfers(...data.args)
      }
      case 'getCurrentAccount': {
        const account = this.walletController.getCurrentAccount()
        return new Promise(resolve =>
          resolve({
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

  _removeRequest(request) {
    this.requests = this.requests.filter(req => req.uuid !== request.uuid)
  }
}

export default CustomizatorController
