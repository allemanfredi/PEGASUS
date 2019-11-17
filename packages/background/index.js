import Duplex from '@pegasus/utils/duplex'
import PegasusEngine from './pegasus-engine'
import Utils from '@pegasus/utils/utils'
import { backgroundMessanger } from '@pegasus/utils/messangers'

const duplex = new Duplex.Host()

const backgroundScript = {

  engine: Utils.requestHandler(
    new PegasusEngine()
  ),

  run () {
    backgroundMessanger.init(duplex)

    this.bindPopupDuplex()
    this.bindTabDuplex()
    this.bindWalletEvents()
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
    duplex.on('pushTransferFromPopup',this.engine.pushTransferFromPopup)
    duplex.on('rejectAllTransfers', this.engine.rejectAllTransfers)
    duplex.on('rejectTransfer', this.engine.rejectTransfer)
    duplex.on('confirmTransfer', this.engine.confirmTransfer)

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
        case 'addNeighbors': {
          this.engine.pushRequest('addNeighbors', { uuid, resolve, data })
          break
        }
        case 'attachToTangle': {
          this.engine.pushRequest('attachToTangle', { uuid, resolve, data })
          break
        }
        case 'broadcastTransactions': {
          this.engine.pushRequest('broadcastTransactions', { uuid, resolve, data })
          break
        }
        case 'broadcastBundle': {
          this.engine.pushRequest('broadcastBundle', { uuid, resolve, data, website })
          break
        }
        case 'checkConsistency': {
          this.engine.pushRequest('checkConsistency', { uuid, resolve, data, website })
          break
        }
        case 'findTransactionObjects': {
          this.engine.pushRequest('findTransactionObjects', { uuid, resolve, data, website })
          break
        }
        case 'findTransactions': {
          this.engine.pushRequest('findTransactions', { uuid, resolve, data, website })
          break
        }
        case 'getBalances': {
          this.engine.pushRequest('getBalances', { uuid, resolve, data, website })
          break
        }
        case 'getBundle': {
          this.engine.pushRequest('getBundle', { uuid, resolve, data, website })
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
        case 'getInclusionStates': {
          this.engine.pushRequest('getInclusionStates', { uuid, resolve, data, website })
          break
        }
        case 'getLatestInclusion': {
          this.engine.pushRequest('getLatestInclusion', { uuid, resolve, data, website })
          break
        }
        case 'getNeighbors': {
          this.engine.pushRequest('getNeighbors', { uuid, resolve, data, website })
          break
        }
        case 'getNodeInfo': {
          this.engine.pushRequest('getNodeInfo', { uuid, resolve, website })
          break
        }
        case 'getTips': {
          this.engine.pushRequest('getTips', { uuid, resolve, website })
          break
        }
        case 'getTransactionObjects': {
          this.engine.pushRequest('getTransactionObjects', { uuid, resolve, data, website })
          break
        }
        case 'getTransactionsToApprove': {
          this.engine.pushRequest('getTransactionObjects', { uuid, resolve, data, website })
          break
        }
        case 'getTrytes': {
          this.engine.pushRequest('getTrytes', { uuid, resolve, data, website })
          break
        }
        case 'isPromotable': {
          this.engine.pushRequest('isPromotable', { uuid, resolve, data, website })
          break
        }
        case 'prepareTransfer': {
          this.engine.pushTransfer(data, uuid, resolve, website)
          break
        }
        case 'promoteTransaction': {
          this.engine.pushRequest('promoteTransaction', { uuid, resolve, data, website })
          break
        }
        case 'removeNeighbors': {
          this.engine.pushRequest('removeNeighbors', { uuid, resolve, data, website })
          break
        }
        case 'replayBundle': {
          this.engine.pushRequest('replayBundle', { uuid, resolve, data, website })
          break
        }
        case 'sendTrytes': {
          this.engine.pushRequest('sendTrytes', { uuid, resolve, data, website })
          break
        }
        case 'storeAndBroadcast': {
          this.engine.pushRequest('storeAndBroadcast', { uuid, resolve, data, website })
          break
        }
        case 'storeTransactions': {
          this.engine.pushRequest('storeTransactions', { uuid, resolve, data, website })
          break
        }
        case 'traverseBundle': {
          this.engine.pushRequest('traverseBundle', { uuid, resolve, data, website })
          break
        }
      }
    })
  },

  bindWalletEvents () {
    this.engine.on('setTranfers', transfers =>
      backgroundMessanger.setTranfers(transfers)
    )

    this.engine.on('setNetworks', networks =>
      backgroundMessanger.setNetworks(networks)
    )

    this.engine.on('setNetwork', network =>
      backgroundMessanger.setNetwork(network)
    )

    this.engine.on('setAccount', account =>
      backgroundMessanger.setAccount(account)
    )

    this.engine.on('setConfirmationLoading', isLoading =>
      backgroundMessanger.setConfirmationLoading(isLoading)
    )

    this.engine.on('setConfirmationError', error =>
      backgroundMessanger.setConfirmationError(error)
    )

    this.engine.on('setProvider', provider =>
      backgroundMessanger.setProvider(provider)
    )

    this.engine.on('setAppState', state =>
      backgroundMessanger.setAppState(state)
    )
  }
}

backgroundScript.run()
