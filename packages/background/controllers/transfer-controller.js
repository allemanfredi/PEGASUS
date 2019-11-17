import Duplex from '@pegasus/utils/duplex'
import { backgroundMessanger } from '@pegasus/utils/messangers'
import { APP_STATE } from '@pegasus/utils/states'
import Utils from '@pegasus/utils/utils'
import { composeAPI } from '@iota/core'
import { asciiToTrytes } from '@iota/converter'

class TransferController {

  constructor (options) {

    const duplex = new Duplex.Host()
    backgroundMessanger.init(duplex)

    const {
      connectorController,
      walletController,
      popupController,
      networkController
    } = options

    this.connectorController = connectorController
    this.walletController = walletController
    this.popupController = popupController
    this.networkController = networkController

    this.transfers = []
  }

  pushTransfer (transfer, uuid, resolve, website) {
    const currentState = this.walletController.getState()
    if (currentState > APP_STATE.WALLET_LOCKED) {
      this.walletController.setState(APP_STATE.WALLET_TRANSFERS_IN_QUEUE)
    } else {
      console.log('locked')
    }      
    
    //check permissions
    if (!transfer.isPopup) {
      const connection = this.connectorController.getConnection(website.origin)
      if (!connection) {
        this.walletController.setState(APP_STATE.WALLET_REQUEST_PERMISSION_OF_CONNECTION)
        this.connectorController.setConnectionToStore({
          website,
          requestToConnect: true,
          connected: false,
          enabled: false
        })
      }
      else if (!connection.enabled) {
        this.walletController.setState(APP_STATE.WALLET_REQUEST_PERMISSION_OF_CONNECTION)
      }
    }

    const obj = {
      transfer,
      uuid,
      resolve
    }

    this.transfers.push(obj)
    
    this.popupController.setPopup(null)

    if (!transfer.isPopup) {
      this.popupController.openPopup()
    }

    if (currentState > APP_STATE.WALLET_LOCKED) {
      backgroundMessanger.setTransfers(this.transfers)
    }

    return
  }

  pushTransferFromPopup (transfer) {
    const currentState = this.walletController.getState()
    if (currentState > APP_STATE.WALLET_LOCKED) {
      this.walletController.setState(APP_STATE.WALLET_TRANSFERS_IN_QUEUE)
    } else {
      console.log('locked')
    }

    const obj = {
      transfer,
      uuid: transfer.uuid,
      resolve: null
    }

    this.transfers.push(obj)
    if (currentState > APP_STATE.WALLET_LOCKED)
      backgroundMessanger.setTransfers(this.transfers)
    return
  }

  confirmTransfer (transfer) {
    backgroundMessanger.setConfirmationLoading(true)

    let transfers = transfer.transfer.args[0]
    const network = this.networkController.getCurrentNetwork()
    const iota = composeAPI({ provider: network.provider })
    const resolve = this.transfers.filter(t => t.uuid === transfer.uuid)[0].resolve

    const key = this.walletController.getKey()
    const account = this.walletController.getCurrentAccount()
    const seed = Utils.aes256decrypt(account.seed, key)

    const depth = 3
    const minWeightMagnitude = network.difficulty

    // convert message and tag from char to trits
    transfers.forEach(t => {
      t.value = parseInt(t.value)
      t.tag = asciiToTrytes(JSON.stringify(t.tag))
      t.message = asciiToTrytes(JSON.stringify(t.message))
    })

    try {
      iota.prepareTransfers(seed, transfers)
        .then(trytes => {
          return iota.sendTrytes(trytes, depth, minWeightMagnitude)
        })
        .then(async bundle => {
          this.removeTransfer(transfer)
          backgroundMessanger.setTransfers(this.transfers)
          this.walletController.setState(APP_STATE.WALLET_UNLOCKED)

          //injection
          if (resolve) {
            resolve({ data: bundle, success: true, uuid: transfer.uuid })
          }

          // since every transaction is generated a new address, it's necessary to modify the hook
          /*iota.getAccountData(seed, (err, data) => {
            backgroundMessanger.setAddress(data.latestAddress)
          })*/
          //TODO update the address since after each transfer the address must change

          // comunicates to the popup the new app State
          backgroundMessanger.setAppState(APP_STATE.WALLET_UNLOCKED)
          backgroundMessanger.setConfirmationLoading(false)
        })
        .catch(err => {
          backgroundMessanger.setConfirmationError(err.message)
          backgroundMessanger.setConfirmationLoading(false)
          resolve({ data: err.message, success: false, uuid: transfer.uuid })
        })
    } catch (err) {
      backgroundMessanger.setConfirmationError(err.message)
      backgroundMessanger.setConfirmationLoading(false)
      resolve({ data: err.message, success: false, uuid: transfer.uuid })
    }
    return
  }

  removeTransfer (transfer) {
    this.transfers = this.transfers.filter(t => t.uuid !== transfer.uuid)
    if (this.transfers.length === 0) {
      this.walletController.setState(APP_STATE.WALLET_UNLOCKED)
      this.popupController.closePopup()
    }
  }

  getTransfers () {
    // remove callback
    const transfers = this.transfers.map(obj => { 
      return { 
        transfer: obj.transfer, 
        uuid: obj.uuid 
      }
    })
    return transfers
  }

  rejectAllTransfers () {
    this.transfers.filter(p => {
      p.resolve({
        data: 'Transaction has been rejected',
        success: false,
        uuid: p.uuid
      })
    })
    this.transfers = []
    this.popupController.closePopup()
    this.walletController.setState(APP_STATE.WALLET_UNLOCKED)
  }

  rejectTransfer (transfer) {
    const resolve = this.transfers.filter(t => transfer.uuid === t.uuid)[0].resolve
    this.transfers = this.transfers.filter(t => t.uuid !== transfer.uuid)

    if (resolve) {
      resolve({
        data: 'Transaction has been rejected',
        success: false,
        uuid: transfer.uuid
      })
    }

    if (this.transfers.length === 0) {
      this.walletController.setState(APP_STATE.WALLET_UNLOCKED)
      this.popupController.closePopup()
    }
  }

}

export default TransferController