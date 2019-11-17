import { composeAPI } from '@iota/core'
import { APP_STATE } from '@pegasus/utils/states'

class CustomizatorController {
  constructor (options, provider) {

    const {
      connectorController,
      walletController,
      popupController
    } = options

    this.connectorController = connectorController
    this.walletController = walletController
    this.popupController = popupController

    this.requests = []

    if (provider)
      this.iota = composeAPI({ provider })
  }

  setRequests (requests) {
    this.requests = requests
  }

  getRequests () {
    return this.requests
  }

  setProvider (provider) {
    this.iota = composeAPI({ provider })
  }

  setWalletController (walletController) {
    this.walletController = walletController
  }

  // CUSTOM iotajs functions
  // if wallet is locked user must login, after having do it, wallet will execute 
  //every request put in the queue IF USER  GRANTed PERMISSIONS
  pushRequest (method, uuid, resolve, data, website) {
    const connection = this.connectorController.getConnection(website.origin)
    let mockConnection = connection
    let isPopupAlreadyOpened = false

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
      this.requests.push(request)
    } else if (connection.enabled) {
      this.request(method, { uuid, resolve, data })
    } 
  }

  executeRequests () {
    this.requests.forEach(request => {
      const method = request.method
      const uuid = request.uuid
      const resolve = request.resolve
      if (request.connection.enabled) {
        const data = request.data
        
        const seed = this.walletController.getCurrentSeed()
        
        this.request(method, {
          uuid,
          resolve,
          seed,
          data
        })
      } else {
        resolve({ data: 'no permissions', success: false, uuid })
      }
    })
    this.requests = []
  }

  rejectRequests() {
    this.requests.forEach(r => {
      r.resolve({
        data: 'Request has been rejected by the user',
        success: false,
        uuid: r.uuid
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
        const network = this.walletController.getCurrentNetwork()
        resolve({ data: network.provider, success: true, uuid })
        break
      }
      default: {
        if (data) {
          this.iota[method](...data.args)
          .then(res => resolve({ data: res, success: true, uuid }))
          .catch(err => resolve({ data: err.message, success: false, uuid }))
        } else {
          this.iota[method]()
          .then(res => resolve({ data: res, success: true, uuid }))
          .catch(err => resolve({ data: err.message, success: false, uuid }))
        }
      }
    }
  }
}

export default CustomizatorController
