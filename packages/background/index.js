import Duplex from '@pegasus/utils/duplex'
import PegasusEngine from './pegasus-engine'
import Utils from '@pegasus/utils/utils'

const duplex = new Duplex.Host()

const backgroundScript = {

  engine: Utils.requestHandler(
    new PegasusEngine()
  ),

  run () {

    this.bindPopupDuplex()
    this.bindTabDuplex()
  },

  bindPopupDuplex () {
    // Wallet Service
    duplex.on('isWalletSetup', this.engine.isWalletSetup)
    duplex.on('setupWallet', this.engine.setupWallet)
    duplex.on('setStorageKey', this.engine.setStorageKey)
    duplex.on('writeOnLocalStorage', this.engine.writeOnLocalStorage)
    duplex.on('unlockWallet', this.engine.unlockWallet)
    duplex.on('restoreWallet', this.engine.restoreWallet)
    duplex.on('unlockSeed', this.engine.unlockSeed)
    duplex.on('storePassword', this.engine.storePassword)
    duplex.on('setPassword', this.engine.setPassword)
    duplex.on('comparePassword', this.engine.comparePassword)

    duplex.on('setCurrentNetwork', this.engine.setCurrentNetwork)
    duplex.on('getCurrentNetwork', this.engine.getCurrentNetwork)
    duplex.on('addNetwork', this.engine.addNetwork)
    duplex.on('getAllNetworks', this.engine.getAllNetworks)
    duplex.on('deleteCurrentNetwork', this.engine.deleteCurrentNetwork)

    duplex.on('addAccount', this.engine.addAccount)
    duplex.on('isAccountNameAlreadyExists', this.engine.isAccountNameAlreadyExists)
    duplex.on('getCurrentAccount', this.engine.getCurrentAccount)
    duplex.on('getAllAccounts', this.engine.getAllAccounts)
    duplex.on('setCurrentAccount', this.engine.setCurrentAccount)
    duplex.on('updateNameAccount', this.engine.updateNameAccount)
    duplex.on('deleteAccount', this.engine.deleteAccount)

    duplex.on('resetData', this.engine.resetData)

    duplex.on('generateSeed', this.engine.generateSeed)
    duplex.on('isSeedValid', this.engine.isSeedValid)

    duplex.on('checkSession', this.engine.checkSession)
    duplex.on('deleteSession', this.engine.deleteSession)
    duplex.on('startSession', this.engine.startSession)

    duplex.on('getState', this.engine.getState)
    duplex.on('setState', this.engine.setState)

    duplex.on('getTransfers', this.engine.getTransfers)
    duplex.on('pushTransfersFromPopup',this.engine.pushTransfersFromPopup)
    duplex.on('rejectAllTransfers', this.engine.rejectAllTransfers)
    duplex.on('rejectTransfer', this.engine.rejectTransfer)
    duplex.on('confirmTransfers', this.engine.confirmTransfers)

    duplex.on('getRequests', this.engine.getRequests)
    duplex.on('rejectRequests', this.engine.rejectRequests)

    duplex.on('startHandleAccountData', this.engine.startHandleAccountData)
    duplex.on('stopHandleAccountData', this.engine.stopHandleAccountData)
    duplex.on('loadAccountData', this.engine.loadAccountData)
    duplex.on('reloadAccountData', this.engine.reloadAccountData)

    duplex.on('openPopup', this.engine.openPopup)
    duplex.on('closePopup', this.engine.closePopup)

    duplex.on('executeRequests', this.engine.executeRequests)
    duplex.on('getConnection', this.engine.getConnection)
    duplex.on('pushConnection', this.engine.pushConnection)
    duplex.on('updateConnection', this.engine.updateConnection)
    duplex.on('completeConnection', this.engine.completeConnection)
    duplex.on('rejectConnection', this.engine.rejectConnection)
    duplex.on('getWebsite', this.engine.getWebsite)

    duplex.on('startFetchMam', this.engine.startFetchMam)
  },

  bindTabDuplex () {
    duplex.on('tabRequest', async ({ resolve, data: { action, data, uuid, website } }) => {
      switch (action) {
        case 'init': {    
          const currentNetwork = this.engine.getCurrentNetwork()
          this.engine.setWebsite(website)
          const response = {
            selectedProvider: currentNetwork
          }

          resolve({
            success: true,
            data: response,
            uuid
          })
          break
        }
        case 'connect' : {
          this.engine.connect(uuid, resolve, website)
          break
        }
        case 'getCurrentAccount': {
          this.engine.pushRequest('getCurrentAccount', { uuid, resolve, data, website })
          break
        }
        case 'getCurrentNode': {
          this.engine.pushRequest('getCurrentNode', { uuid, resolve, website })
          break
        }
        case 'prepareTransfers': {
          this.engine.pushTransfers(data, uuid, resolve, website)
          break
        }
      }
    })
  }
}

backgroundScript.run()
