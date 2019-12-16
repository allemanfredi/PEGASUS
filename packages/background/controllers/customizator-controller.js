import { composeAPI } from '@iota/core'
import { APP_STATE } from '@pegasus/utils/states'

class CustomizatorController {
  constructor (options, provider) {

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
    this.mamRequestsWithUserInteraction = []

    if (provider)
      this.iota = composeAPI({ provider })
  }

  setRequests (requests) {
    this.requests = requests
  }

  getRequests () {
    return this.requests
  }

  getMamRequestsWithUserInteraction () {
    return this.mamRequestsWithUserInteraction
  }

  setProvider (provider) {
    this.iota = composeAPI({ provider })
  }

  setWalletController (walletController) {
    this.walletController = walletController
  }

  setNetworkController (networkController) {
    this.networkController = networkController
  }

  // CUSTOM iotajs functions
  // if wallet is locked user must login, after having do it, wallet will execute 
  //every request put in the queue IF USER  GRANTed PERMISSIONS
  pushRequest (method, uuid, resolve, data, website) {
    const connection = this.connectorController.getConnection(website.origin)
    let mockConnection = connection
    let isPopupAlreadyOpened = false

    const mamRequestsWithUserInteraction = [
      'mam_init',
      'mam_changeMode'
    ]

    const popup = this.popupController.getPopup()

    if (!connection) {
      this.walletController.setState(APP_STATE.WALLET_REQUEST_PERMISSION_OF_CONNECTION)
      this.popupController.openPopup()
      mockConnection = {
        website,
        requestToConnect: true,
        connected: false,
        enabled: false
      }
      this.connectorController.setConnectionToStore(connection)
      isPopupAlreadyOpened = true
    } else if (!connection.enabled) {
      this.walletController.setState(APP_STATE.WALLET_REQUEST_PERMISSION_OF_CONNECTION)

      if (!popup) {
        this.popupController.openPopup()
      }

      isPopupAlreadyOpened = true
    }

    const state = this.walletController.getState()

    if (state <= APP_STATE.WALLET_LOCKED || !connection  || !connection.enabled) {
      if (!popup && isPopupAlreadyOpened === false){
        this.popupController.openPopup()
      }

      const request = {
        connection: mockConnection,
        method,
        uuid,
        resolve,
        data
      }
      
      if (mamRequestsWithUserInteraction.includes(method)) {
        this.mamRequestsWithUserInteraction.push(request)
      } else this.requests.push(request)

    } else if (connection.enabled && state >= APP_STATE.WALLET_UNLOCKED) {

      if (mamRequestsWithUserInteraction.includes(method)) {
        this.mamRequestsWithUserInteraction.push({
          connection,
          method,
          uuid,
          resolve,
          data
        })
        this.popupController.openPopup()
      } else this.request(method, { uuid, resolve, data })
    } 
  }

  //request that does not need of popup interaction (ex: getCurrentAccount)
  executeRequests () {
    this.requests.forEach(request => {
      const method = request.method
      const uuid = request.uuid
      const resolve = request.resolve
      if (request.connection.enabled) {
        const data = request.data
                
        this.request(method, {
          uuid,
          resolve,
          data
        })
      } else {
        resolve({ data: 'No granted permissions', success: false, uuid })
      }
    })
    this.requests = []
  }

  confirmMamRequest (request) {
    const requestToConfirm = this.mamRequestsWithUserInteraction.find(
      req => req.uuid === request.uuid
    )
    this.request(
      requestToConfirm.method,
      {
        uuid: requestToConfirm.uuid,
        resolve: requestToConfirm.resolve,
        data: requestToConfirm.data
      }
    )

    this.mamRequestsWithUserInteraction = this.mamRequestsWithUserInteraction.filter(
      req => req.uuid !== request.uuid
    )
  }

  rejectMamRequest (request) {
    const requestToReject= this.mamRequestsWithUserInteraction.find(
      req => req.uuid === request.uuid
    )

    requestToReject.resolve({
      data: 'Request has been rejected by the user',
      success: false,
      uuid: requestToReject.uuid
    })

    this.mamRequestsWithUserInteraction = this.mamRequestsWithUserInteraction.filter(
      req => req.uuid !== request.uuid
    )
    this.popupController.closePopup()
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
  }

  async request (method, { uuid, resolve, data }) {
    switch (method) {
      case 'getCurrentAccount': {
        const account = this.walletController.getCurrentAccount()
        resolve({ data: account.data.latestAddress, success: true, uuid })
        break
      }
      case 'getCurrentNode': {
        const network = this.networkController.getCurrentNetwork()
        resolve({ data: network.provider, success: true, uuid })
        break
      }
      case 'mam_init': {
        const res = this.mamController.init(...data.args)
        if (res.success === true)
          resolve({data: res.data, success: true, uuid})
        else
          resolve({data: res.error, success: false, uuid})
        break
      }
      case 'mam_changeMode': {
        const res = this.mamController.changeMode(...data.args)
        if (res.success === true)
          resolve({data: res.data, success: true, uuid})
        else
          resolve({data: res.error, success: false, uuid})
        break
      }
      case 'mam_getRoot': {
        const res = this.mamController.getRoot(...data.args)
        if (res.success === true)
          resolve({data: res.data, success: true, uuid})
        else
          resolve({data: res.error, success: false, uuid})
        break
      }
      case 'mam_create': {
        const res = this.mamController.create(...data.args)
        if (res.success === true)
          resolve({data: res.data, success: true, uuid})
        else
          resolve({data: res.error, success: false, uuid})
        break
      }
      default: {
        resolve({ data: 'Method Not Found', success: false, uuid })
      }
    }
  }
}

export default CustomizatorController
