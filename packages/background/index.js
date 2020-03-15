/*import Duplex from '@pegasus/utils/duplex'
import PegasusEngine from './pegasus-engine'
import Utils from '@pegasus/utils/utils'
import { composeAPI } from '@iota/core'

const duplex = new Duplex.Host()

const forbiddenRequests = ['getAccountData', 'getNewAddress', 'getInputs']

const backgroundScript = {
  engine: Utils.requestHandler(new PegasusEngine()),

  run() {
    this.bindPopupApi()
    this.bindTabRequests()
  },

  bindPopupApi() {
    // Wallet Service
    duplex.on('unlockWallet', this.engine.unlockWallet)
    duplex.on('restoreWallet', this.engine.restoreWallet)
    duplex.on('unlockSeed', this.engine.unlockSeed)
    duplex.on('initWallet', this.engine.initWallet)
    duplex.on('comparePassword', this.engine.comparePassword)

    duplex.on('setCurrentNetwork', this.engine.setCurrentNetwork)
    duplex.on('getCurrentNetwork', this.engine.getCurrentNetwork)
    duplex.on('addNetwork', this.engine.addNetwork)
    duplex.on('getAllNetworks', this.engine.getAllNetworks)
    duplex.on('deleteCurrentNetwork', this.engine.deleteCurrentNetwork)

    duplex.on('addAccount', this.engine.addAccount)
    duplex.on(
      'isAccountNameAlreadyExists',
      this.engine.isAccountNameAlreadyExists
    )
    duplex.on('getCurrentAccount', this.engine.getCurrentAccount)
    duplex.on('getAllAccounts', this.engine.getAllAccounts)
    duplex.on('setCurrentAccount', this.engine.setCurrentAccount)
    duplex.on('updateNameAccount', this.engine.updateNameAccount)
    duplex.on('updateAvatarAccount', this.engine.updateAvatarAccount)
    duplex.on('deleteAccount', this.engine.deleteAccount)

    duplex.on('generateSeed', this.engine.generateSeed)

    duplex.on('checkSession', this.engine.checkSession)
    duplex.on('deleteSession', this.engine.deleteSession)

    duplex.on('getState', this.engine.getState)
    duplex.on('setState', this.engine.setState)

    duplex.on('getRequests', this.engine.getRequests)
    duplex.on('rejectRequests', this.engine.rejectRequests)
    duplex.on('getExecutableRequests', this.engine.getExecutableRequests)
    duplex.on('confirmRequest', this.engine.confirmRequest)
    duplex.on('rejectRequest', this.engine.rejectRequest)
    duplex.on('executeRequest', this.engine.executeRequest)

    duplex.on('reloadAccountData', this.engine.reloadAccountData)

    duplex.on('createSeedVault', this.engine.createSeedVault)

    duplex.on('closePopup', this.engine.closePopup)

    duplex.on('getConnection', this.engine.getConnection)
    duplex.on('pushConnection', this.engine.pushConnection)
    duplex.on('updateConnection', this.engine.updateConnection)
    duplex.on('completeConnection', this.engine.completeConnection)
    duplex.on('rejectConnection', this.engine.rejectConnection)
    duplex.on('getConnections', this.engine.getConnections)
    duplex.on('addConnection', this.engine.addConnection)
    duplex.on('removeConnection', this.engine.removeConnection)
    duplex.on('getConnectionRequest', this.engine.getConnectionRequest)

    duplex.on('startFetchMam', this.engine.startFetchMam)
    duplex.on('getMamChannels', this.engine.getMamChannels)
    duplex.on('registerMamChannel', this.engine.registerMamChannel)

    duplex.on('lockWallet', this.engine.lockWallet)

    duplex.on('setPopupSettings', this.engine.setPopupSettings)
    duplex.on('getPopupSettings', this.engine.getPopupSettings)

    duplex.on(
      'enableTransactionsAutoPromotion',
      this.engine.enableTransactionsAutoPromotion
    )
    duplex.on(
      'disableTransactionsAutoPromotion',
      this.engine.disableTransactionsAutoPromotion
    )
  },

  bindTabRequests() {
    duplex.on(
      'tabRequest',
      async ({ url, resolve, data: { action, data, uuid, favicon } }) => {
        const websiteUrl = new URL(url)
        const website = {
          origin: websiteUrl.origin,
          hostname: websiteUrl.hostname,
          favicon
        }

        const iota = composeAPI()
        if (iota[action] && !forbiddenRequests.includes(action)) {
          this.engine.pushRequest(action, {
            data,
            uuid,
            resolve,
            website
          })
          return
        }

        switch (action) {
          case 'getCurrentAccount': {
            this.engine.pushRequest('getCurrentAccount', {
              uuid,
              resolve,
              website
            })
            break
          }
          case 'getCurrentProvider': {
            this.engine.pushRequest('getCurrentProvider', {
              uuid,
              resolve,
              website
            })
            break
          }
          case 'mam_init': {
            this.engine.pushRequest('mam_init', {
              uuid,
              resolve,
              data,
              website
            })
            break
          }
          case 'mam_changeMode': {
            this.engine.pushRequest('mam_changeMode', {
              uuid,
              resolve,
              data,
              website
            })
            break
          }
          case 'mam_getRoot': {
            this.engine.pushRequest('mam_getRoot', {
              uuid,
              resolve,
              data,
              website
            })
            break
          }
          case 'mam_create': {
            this.engine.pushRequest('mam_create', {
              uuid,
              resolve,
              data,
              website
            })
            break
          }
          case 'mam_decode': {
            this.engine.pushRequest('mam_decode', {
              uuid,
              resolve,
              data,
              website
            })
            break
          }
          case 'mam_attach': {
            this.engine.pushRequest('mam_attach', {
              uuid,
              resolve,
              data,
              website
            })
            break
          }
          case 'mam_fetch': {
            this.engine.pushRequest('mam_fetch', {
              uuid,
              resolve,
              data,
              website
            })
            break
          }
          case 'mam_fetchSingle': {
            this.engine.pushRequest('mam_fetchSingle', {
              uuid,
              resolve,
              data,
              website
            })
            break
          }
          default: {
            resolve({
              success: false,
              data: 'Request not available',
              uuid
            })
            break
          }
        }
      }
    )
  }
}

backgroundScript.run()
*/

import extension from 'extensionizer'
import PortStream from 'extension-port-stream'
import PegasusEngine from './pegasus-engine'
import ObjectMultiplex from 'obj-multiplex'
import logger from '@pegasus/utils/logger'
import pump from 'pump'

const engine = new PegasusEngine()

extension.runtime.onConnect.addListener(port => handleConnection(port))


const handleConnection = port => {

  if (port.name === 'popup') {
    const portStream = new PortStream(port)
    // communication with popup

    const mux = new ObjectMultiplex()
    pump(
      portStream,
      mux,
      portStream,
      (err) => {
        if (err) {
          logger.error(err)
        }
      }
    )

    engine.setupEngineConnectionWithPopup(mux.createStream('engine'))
  }

  if (port.sender && port.sender.tab && port.sender.url) {
    
    port.onMessage.addListener((msg) => {
      if (msg.data && msg.data.method === 'connect') {
        //this.engine.connect(uuid, resolve, website)
      }
    })

    const portStream = new PortStream(port)
    const mux = new ObjectMultiplex()
    pump(
      portStream,
      mux,
      portStream,
      (err) => {
        if (err) {
          logger.error(err)
        }
      }
    )
        
    // messages between inpage and background
    engine.setupInpageClientConnection(mux.createStream('inpageClient'), port.sender)
  }
}