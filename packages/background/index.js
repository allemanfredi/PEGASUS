import MessageDuplex from '@pegasus/lib/MessageDuplex'
import WalletService from './services/WalletService'

import Utils from '@pegasus/lib/utils'
import randomUUID from 'uuid/v4'

import { BackgroundAPI } from '@pegasus/lib/api'
import { APP_STATE } from '@pegasus/lib/states'

const duplex = new MessageDuplex.Host()

const backgroundScript = {

  walletService: Utils.requestHandler(
    new WalletService()
  ),

  run () {
    BackgroundAPI.init(duplex)

    this.bindPopupDuplex()
    this.bindTabDuplex()
    this.bindWalletEvents()
  },

  bindPopupDuplex () {
    // Wallet Service
    duplex.on('isWalletSetup', this.walletService.isWalletSetup)
    duplex.on('setupWallet', this.walletService.setupWallet)
    duplex.on('initStorageDataService', this.walletService.initStorageDataService)
    duplex.on('writeOnLocalStorage', this.walletService.writeOnLocalStorage)
    duplex.on('unlockWallet', this.walletService.unlockWallet)
    duplex.on('restoreWallet', this.walletService.restoreWallet)
    duplex.on('unlockSeed', this.walletService.unlockSeed)
    duplex.on('getKey', this.walletService.getKey)
    duplex.on('storePassword', this.walletService.storePassword)
    duplex.on('setPassword', this.walletService.setPassword)
    duplex.on('comparePassword', this.walletService.comparePassword)

    duplex.on('setCurrentNetwork', this.walletService.setCurrentNetwork)
    duplex.on('getCurrentNetwork', this.walletService.getCurrentNetwork)
    duplex.on('addNetwork', this.walletService.addNetwork)
    duplex.on('getAllNetworks', this.walletService.getAllNetworks)
    duplex.on('deleteCurrentNetwork', this.walletService.deleteCurrentNetwork)

    duplex.on('addAccount', this.walletService.addAccount)
    duplex.on('isAccountNameAlreadyExists', this.walletService.isAccountNameAlreadyExists)
    duplex.on('getCurrentAccount', this.walletService.getCurrentAccount)
    duplex.on('getAllAccounts', this.walletService.getAllAccounts)
    duplex.on('setCurrentAccount', this.walletService.setCurrentAccount)
    duplex.on('updateDataAccount', this.walletService.updateDataAccount)
    duplex.on('updateNameAccount', this.walletService.updateNameAccount)
    duplex.on('deleteAccount', this.walletService.deleteAccount)

    duplex.on('resetData', this.walletService.resetData)

    duplex.on('generateSeed', this.walletService.generateSeed)
    duplex.on('isSeedValid', this.walletService.isSeedValid)

    duplex.on('checkSession', this.walletService.checkSession)
    duplex.on('deleteSession', this.walletService.deleteSession)
    duplex.on('startSession', this.walletService.startSession)

    duplex.on('getState', this.walletService.getState)
    duplex.on('setState', this.walletService.setState)

    duplex.on('getPayments', this.walletService.getPayments)
    duplex.on('pushPayment', ({ hostname, data, resolve, reject }) => {
      const uuid = randomUUID()
      this.walletService.pushPayment(data, uuid, resolve)
    })
    duplex.on('rejectAllPayments', this.walletService.rejectAllPayments)
    duplex.on('rejectPayment', this.walletService.rejectPayment)
    duplex.on('confirmPayment', this.walletService.confirmPayment)

    duplex.on('getRequests', this.walletService.getRequests)
    duplex.on('rejectRequests', this.walletService.rejectRequests)

    duplex.on('startHandleAccountData', this.walletService.startHandleAccountData)
    duplex.on('stopHandleAccountData', this.walletService.stopHandleAccountData)
    duplex.on('loadAccountData', this.walletService.loadAccountData)
    duplex.on('reloadAccountData', this.walletService.reloadAccountData)

    duplex.on('openPopup', this.walletService.openPopup)
    duplex.on('closePopup', this.walletService.closePopup)

    duplex.on('executeRequests', this.walletService.executeRequests)
    duplex.on('getConnection', this.walletService.getConnection)
    duplex.on('pushConnection', this.walletService.pushConnection)
    duplex.on('updateConnection', this.walletService.updateConnection)
    duplex.on('completeConnection', this.walletService.completeConnection)
    duplex.on('rejectConnection', this.walletService.rejectConnection)

    duplex.on('startFetchMam', this.walletService.startFetchMam)
    duplex.on('getOrigin', this.walletService.getOrigin)
  },

  bindTabDuplex () {
    duplex.on('tabRequest', async ({ hostname, resolve, data: { action, data, uuid, origin } }) => {
      switch (action) {
        case 'init': {
          let response = {
            selectedAddress: '',
            selectedProvider: ''
          }
          
          const currentNetwork = this.walletService.getCurrentNetwork()
          const account = this.walletService.getCurrentAccount()
          this.walletService.setOrigin(origin)
          response = {
            selectedAddress: account ? account.data.latestAddress : null,
            selectedProvider: currentNetwork.provider
          }

          resolve({
            success: true,
            data: response,
            uuid
          })
          break
        }
        case 'connect' : {
          this.walletService.connect(data, uuid, resolve)
          break
        }
        case 'addNeighbors': {
          this.walletService.pushRequest('addNeighbors', { uuid, resolve, data, origin })
          break
        }
        case 'attachToTangle': {
          this.walletService.pushRequest('attachToTangle', { uuid, resolve, data, origin })
          break
        }
        case 'broadcastTransactions': {
          this.walletService.pushRequest('broadcastTransactions', { uuid, resolve, data, origin })
          break
        }
        case 'broadcastBundle': {
          this.walletService.pushRequest('broadcastBundle', { uuid, resolve, data, origin })
          break
        }
        case 'checkConsistency': {
          this.walletService.pushRequest('checkConsistency', { uuid, resolve, data, origin })
          break
        }
        case 'findTransactionObjects': {
          this.walletService.pushRequest('findTransactionObjects', { uuid, resolve, data, origin })
          break
        }
        case 'findTransactions': {
          this.walletService.pushRequest('findTransactions', { uuid, resolve, data, origin })
          break
        }
        case 'getBalances': {
          this.walletService.pushRequest('getBalances', { uuid, resolve, data, origin })
          break
        }
        case 'getBundle': {
          this.walletService.pushRequest('getBundle', { uuid, resolve, data, origin })
          break
        }
        case 'getInclusionStates': {
          this.walletService.pushRequest('getInclusionStates', { uuid, resolve, data, origin })
          break
        }
        case 'getLatestInclusion': {
          this.walletService.pushRequest('getLatestInclusion', { uuid, resolve, data, origin })
          break
        }
        case 'getNeighbors': {
          this.walletService.pushRequest('getNeighbors', { uuid, resolve, data, origin })
          break
        }
        case 'getNodeInfo': {
          this.walletService.pushRequest('getNodeInfo', { uuid, resolve, origin })
          break
        }
        case 'getTips': {
          this.walletService.pushRequest('getTips', { uuid, resolve, origin })
          break
        }
        case 'getTransactionObjects': {
          this.walletService.pushRequest('getTransactionObjects', { uuid, resolve, data, origin })
          break
        }
        case 'getTransactionsToApprove': {
          this.walletService.pushRequest('getTransactionObjects', { uuid, resolve, data, origin })
          break
        }
        case 'getTrytes': {
          this.walletService.pushRequest('getTrytes', { uuid, resolve, data, origin })
          break
        }
        case 'isPromotable': {
          this.walletService.pushRequest('isPromotable', { uuid, resolve, data, origin })
          break
        }
        case 'prepareTransfer': {
          // in order to not open extensionizer popup
          data['isPopup'] = false
          this.walletService.pushPayment(data, uuid, resolve, origin)
          break
        }
        case 'promoteTransaction': {
          this.walletService.pushRequest('promoteTransaction', { uuid, resolve, data, origin })
          break
        }
        case 'removeNeighbors': {
          this.walletService.pushRequest('removeNeighbors', { uuid, resolve, data, origin })
          break
        }
        case 'replayBundle': {
          this.walletService.pushRequest('replayBundle', { uuid, resolve, data, origin })
          break
        }
        case 'sendTrytes': {
          this.walletService.pushRequest('sendTrytes', { uuid, resolve, data, origin })
          break
        }
        case 'storeAndBroadcast': {
          this.walletService.pushRequest('storeAndBroadcast', { uuid, resolve, data, origin })
          break
        }
        case 'storeTransactions': {
          this.walletService.pushRequest('storeTransactions', { uuid, resolve, data, origin })
          break
        }
        case 'traverseBundle': {
          this.walletService.pushRequest('traverseBundle', { uuid, resolve, data, origin })
          break
        }
      }
    })
  },

  bindWalletEvents () {
    this.walletService.on('setPayments', payments =>
      BackgroundAPI.setPayments(payments)
    )

    this.walletService.on('setNetworks', networks =>
      BackgroundAPI.setNetworks(networks)
    )

    this.walletService.on('setNetwork', network =>
      BackgroundAPI.setNetwork(network)
    )

    this.walletService.on('setAccount', account =>
      BackgroundAPI.setAccount(account)
    )

    this.walletService.on('setConfirmationLoading', isLoading =>
      BackgroundAPI.setConfirmationLoading(isLoading)
    )

    this.walletService.on('setConfirmationError', error =>
      BackgroundAPI.setConfirmationError(error)
    )

    this.walletService.on('setAddress', address =>
      BackgroundAPI.setAddress(address)
    )

    this.walletService.on('setProvider', provider =>
      BackgroundAPI.setProvider(provider)
    )

    this.walletService.on('setAppState', state =>
      BackgroundAPI.setAppState(state)
    )
  }
}

backgroundScript.run()
