import Mam from '@iota/mam/lib/mam.web.min.js'
import { trytesToAscii } from '@iota/converter'
import Utils from '@pegasus/utils/utils'
import { backgroundMessanger } from '@pegasus/utils/messangers'
import { APP_STATE } from '@pegasus/utils/states'

class MamController {

  constructor (options) {

    const {
      storageController,
    } = options

    this.storageController = storageController
  }

  setNetworkController (networkController) {
    this.networkController = networkController
  }

  setWalletController (walletController) {
    this.walletController = walletController
  }

  init (seed = null, security = 2) {
    const network = this.networkController.getCurrentNetwork()

    //NOTE with seed = null doesn't work
    /*const state = seed
      ? Mam.init(network.provider)
      : Mam.init(network.provider, seed, security)*/
    const state = Mam.init(network.provider)

    const id = Utils.sha256(state.seed)
    
    const encryptionKey = this.walletController.getKey()
    const mamChannels = this.storageController.getMamChannels()
    const currentAccount = this.walletController.getCurrentAccount()

    //encrypt the channel seed in order to not store it in plain text
    const stateToStore = Utils.copyObject(state)
    stateToStore.seed = Utils.aes256encrypt(stateToStore.seed, encryptionKey)

    if (!mamChannels[currentAccount.id]){
      mamChannels[currentAccount.id] = {
        owner: {}
      }
    }

    mamChannels[currentAccount.id]['owner'][id] = stateToStore
    this.storageController.setMamChannels(mamChannels, true)

    state.seed = Utils.sha256(state.seed)
    delete state.channel.side_key

    return {
      success: true,
      data: state
    }
  }

  changeMode(state, mode, sidekey = null) {
    const id = state.seed
    
    const encryptionKey = this.walletController.getKey()
    const mamChannels = this.storageController.getMamChannels()
    const currentAccount = this.walletController.getCurrentAccount()

    if (!mamChannels[currentAccount.id]['owner'][id]) {
      return {
        success: false,
        error: 'Channel Not Found'
      }
    }

    const encryptedState = mamChannels[currentAccount.id]['owner'][id]
    state.seed = Utils.aes256decrypt(encryptedState.seed, encryptionKey)
    if (encryptedState.channel.side_key)
      state.channel.side_key = Utils.aes256decrypt(encryptedState.channel.side_key, encryptionKey)

    const stateToStore = Mam.changeMode(state, mode, sidekey)

    stateToStore.seed = Utils.aes256encrypt(stateToStore.seed, encryptionKey)
    if (stateToStore.channel.side_key)
      stateToStore.channel.side_key = Utils.aes256encrypt(stateToStore.channel.side_key, encryptionKey)

    mamChannels[currentAccount.id]['owner'][id] = stateToStore
    
    this.storageController.setMamChannels(mamChannels, true)

    const stateToReturn = Utils.copyObject(stateToStore)
    stateToReturn.seed = Utils.sha256(stateToReturn.seed)
    delete stateToReturn.channel.side_key

    return {
      success: true,
      data: stateToReturn
    }
  }

  getRoot(state) {
    const id = state.seed
    
    const decryptionKey = this.walletController.getKey()
    const mamChannels = this.storageController.getMamChannels()
    const currentAccount = this.walletController.getCurrentAccount()

    if (!mamChannels[currentAccount.id]['owner'][id]) {
      return {
        success: false,
        error: 'Channel Not Found'
      }
    }

    const encryptedState = mamChannels[currentAccount.id]['owner'][id]
    state.seed = Utils.aes256decrypt(encryptedState.seed, decryptionKey)

    const root = Mam.getRoot(state)

    return {
      success: true,
      data: root
    }
  }

  create(state, message) {
    const id = state.seed
    
    const decryptionKey = this.walletController.getKey()
    const mamChannels = this.storageController.getMamChannels()
    const currentAccount = this.walletController.getCurrentAccount()

    if (!mamChannels[currentAccount.id]['owner'][id]) {
      return {
        success: false,
        error: 'Channel Not Found'
      }
    }

    const encryptedState = mamChannels[currentAccount.id]['owner'][id]
    state.seed = Utils.aes256decrypt(encryptedState.seed, decryptionKey)
    
    if (state.channel.side_key)
      state.channel.side_key = Utils.aes256decrypt(encryptedState.channel.side_key, decryptionKey)

    const mamMessage = Mam.create(state, message)
    
    mamMessage.state.seed = Utils.sha256(state.seed)
    delete mamMessage.state.channel.side_key
    
    return {
      success: true,
      data: mamMessage
    }
  }

  fetchFromPopup (provider, root, mode, sidekey, callback) {
    try {
      Mam.init(provider)
      Mam.fetch(root, mode, sidekey, event => {
        callback(
          JSON.parse(trytesToAscii(event))
        )
      })
    } catch (error) {
      console.log('MAM fetch error', error)
    }
  }

}

export default MamController
