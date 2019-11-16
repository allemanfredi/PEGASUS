import Duplex from '@pegasus/utils/duplex'
import WalletController from './controllers/wallet-controller'
import Utils from '@pegasus/utils/utils'
import randomUUID from 'uuid/v4'
import { backgroundMessanger } from '@pegasus/utils/messangers'

const duplex = new Duplex.Host()

const backgroundScript = {

  walletController: Utils.requestHandler(
    new WalletController()
  ),

  run () {
    backgroundMessanger.init(duplex)

    this.bindPopupDuplex()
    this.bindTabDuplex()
    this.bindWalletEvents()
  },

  bindPopupDuplex () {
    // Wallet Service
    duplex.on('isWalletSetup', this.walletController.isWalletSetup)
    duplex.on('setupWallet', this.walletController.setupWallet)
    duplex.on('initStorageDataService', this.walletController.initStorageDataService)
    duplex.on('writeOnLocalStorage', this.walletController.writeOnLocalStorage)
    duplex.on('unlockWallet', this.walletController.unlockWallet)
    duplex.on('restoreWallet', this.walletController.restoreWallet)
    duplex.on('unlockSeed', this.walletController.unlockSeed)
    duplex.on('getKey', this.walletController.getKey)
    duplex.on('storePassword', this.walletController.storePassword)
    duplex.on('setPassword', this.walletController.setPassword)
    duplex.on('comparePassword', this.walletController.comparePassword)

    duplex.on('setCurrentNetwork', this.walletController.setCurrentNetwork)
    duplex.on('getCurrentNetwork', this.walletController.getCurrentNetwork)
    duplex.on('addNetwork', this.walletController.addNetwork)
    duplex.on('getAllNetworks', this.walletController.getAllNetworks)
    duplex.on('deleteCurrentNetwork', this.walletController.deleteCurrentNetwork)

    duplex.on('addAccount', this.walletController.addAccount)
    duplex.on('isAccountNameAlreadyExists', this.walletController.isAccountNameAlreadyExists)
    duplex.on('getCurrentAccount', this.walletController.getCurrentAccount)
    duplex.on('getAllAccounts', this.walletController.getAllAccounts)
    duplex.on('setCurrentAccount', this.walletController.setCurrentAccount)
    duplex.on('updateDataAccount', this.walletController.updateDataAccount)
    duplex.on('updateNameAccount', this.walletController.updateNameAccount)
    duplex.on('deleteAccount', this.walletController.deleteAccount)

    duplex.on('resetData', this.walletController.resetData)

    duplex.on('generateSeed', this.walletController.generateSeed)
    duplex.on('isSeedValid', this.walletController.isSeedValid)

    duplex.on('checkSession', this.walletController.checkSession)
    duplex.on('deleteSession', this.walletController.deleteSession)
    duplex.on('startSession', this.walletController.startSession)

    duplex.on('getState', this.walletController.getState)
    duplex.on('setState', this.walletController.setState)

    duplex.on('getPayments', this.walletController.getPayments)
    duplex.on('pushPaymentFromPopup',this.walletController.pushPaymentFromPopup)
    duplex.on('rejectAllPayments', this.walletController.rejectAllPayments)
    duplex.on('rejectPayment', this.walletController.rejectPayment)
    duplex.on('confirmPayment', this.walletController.confirmPayment)

    duplex.on('getRequests', this.walletController.getRequests)
    duplex.on('rejectRequests', this.walletController.rejectRequests)

    duplex.on('startHandleAccountData', this.walletController.startHandleAccountData)
    duplex.on('stopHandleAccountData', this.walletController.stopHandleAccountData)
    duplex.on('loadAccountData', this.walletController.loadAccountData)
    duplex.on('reloadAccountData', this.walletController.reloadAccountData)

    duplex.on('openPopup', this.walletController.openPopup)
    duplex.on('closePopup', this.walletController.closePopup)

    duplex.on('executeRequests', this.walletController.executeRequests)
    duplex.on('getConnection', this.walletController.getConnection)
    duplex.on('pushConnection', this.walletController.pushConnection)
    duplex.on('updateConnection', this.walletController.updateConnection)
    duplex.on('completeConnection', this.walletController.completeConnection)
    duplex.on('rejectConnection', this.walletController.rejectConnection)
    duplex.on('getWebsite', this.walletController.getWebsite)

    duplex.on('startFetchMam', this.walletController.startFetchMam)
  },

  bindTabDuplex () {
    duplex.on('tabRequest', async ({ resolve, data: { action, data, uuid, website } }) => {
      switch (action) {
        case 'init': {    
          const currentNetwork = this.walletController.getCurrentNetwork()
          this.walletController.setWebsite(website)
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
          this.walletController.connect(uuid, resolve, website)
          break
        }
        case 'addNeighbors': {
          this.walletController.pushRequest('addNeighbors', { uuid, resolve, data })
          break
        }
        case 'attachToTangle': {
          this.walletController.pushRequest('attachToTangle', { uuid, resolve, data })
          break
        }
        case 'broadcastTransactions': {
          this.walletController.pushRequest('broadcastTransactions', { uuid, resolve, data })
          break
        }
        case 'broadcastBundle': {
          this.walletController.pushRequest('broadcastBundle', { uuid, resolve, data, website })
          break
        }
        case 'checkConsistency': {
          this.walletController.pushRequest('checkConsistency', { uuid, resolve, data, website })
          break
        }
        case 'findTransactionObjects': {
          this.walletController.pushRequest('findTransactionObjects', { uuid, resolve, data, website })
          break
        }
        case 'findTransactions': {
          this.walletController.pushRequest('findTransactions', { uuid, resolve, data, website })
          break
        }
        case 'getBalances': {
          this.walletController.pushRequest('getBalances', { uuid, resolve, data, website })
          break
        }
        case 'getBundle': {
          this.walletController.pushRequest('getBundle', { uuid, resolve, data, website })
          break
        }
        case 'getCurrentAccount': {
          this.walletController.pushRequest('getCurrentAccount', { uuid, resolve, data, website })
          break
        }
        case 'getCurrentNode': {
          this.walletController.pushRequest('getCurrentNode', { uuid, resolve, website })
          break
        }
        case 'getInclusionStates': {
          this.walletController.pushRequest('getInclusionStates', { uuid, resolve, data, website })
          break
        }
        case 'getLatestInclusion': {
          this.walletController.pushRequest('getLatestInclusion', { uuid, resolve, data, website })
          break
        }
        case 'getNeighbors': {
          this.walletController.pushRequest('getNeighbors', { uuid, resolve, data, website })
          break
        }
        case 'getNodeInfo': {
          this.walletController.pushRequest('getNodeInfo', { uuid, resolve, website })
          break
        }
        case 'getTips': {
          this.walletController.pushRequest('getTips', { uuid, resolve, website })
          break
        }
        case 'getTransactionObjects': {
          this.walletController.pushRequest('getTransactionObjects', { uuid, resolve, data, website })
          break
        }
        case 'getTransactionsToApprove': {
          this.walletController.pushRequest('getTransactionObjects', { uuid, resolve, data, website })
          break
        }
        case 'getTrytes': {
          this.walletController.pushRequest('getTrytes', { uuid, resolve, data, website })
          break
        }
        case 'isPromotable': {
          this.walletController.pushRequest('isPromotable', { uuid, resolve, data, website })
          break
        }
        case 'prepareTransfer': {
          this.walletController.pushPayment(data, uuid, resolve, website)
          break
        }
        case 'promoteTransaction': {
          this.walletController.pushRequest('promoteTransaction', { uuid, resolve, data, website })
          break
        }
        case 'removeNeighbors': {
          this.walletController.pushRequest('removeNeighbors', { uuid, resolve, data, website })
          break
        }
        case 'replayBundle': {
          this.walletController.pushRequest('replayBundle', { uuid, resolve, data, website })
          break
        }
        case 'sendTrytes': {
          this.walletController.pushRequest('sendTrytes', { uuid, resolve, data, website })
          break
        }
        case 'storeAndBroadcast': {
          this.walletController.pushRequest('storeAndBroadcast', { uuid, resolve, data, website })
          break
        }
        case 'storeTransactions': {
          this.walletController.pushRequest('storeTransactions', { uuid, resolve, data, website })
          break
        }
        case 'traverseBundle': {
          this.walletController.pushRequest('traverseBundle', { uuid, resolve, data, website })
          break
        }
      }
    })
  },

  bindWalletEvents () {
    this.walletController.on('setPayments', payments =>
      backgroundMessanger.setPayments(payments)
    )

    this.walletController.on('setNetworks', networks =>
      backgroundMessanger.setNetworks(networks)
    )

    this.walletController.on('setNetwork', network =>
      backgroundMessanger.setNetwork(network)
    )

    this.walletController.on('setAccount', account =>
      backgroundMessanger.setAccount(account)
    )

    this.walletController.on('setConfirmationLoading', isLoading =>
      backgroundMessanger.setConfirmationLoading(isLoading)
    )

    this.walletController.on('setConfirmationError', error =>
      backgroundMessanger.setConfirmationError(error)
    )

    this.walletController.on('setProvider', provider =>
      backgroundMessanger.setProvider(provider)
    )

    this.walletController.on('setAppState', state =>
      backgroundMessanger.setAppState(state)
    )
  }
}

backgroundScript.run()
