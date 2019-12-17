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
    const root = Mam.getRoot(state)

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

    mamChannels[currentAccount.id]['owner'][id] = { ...stateToStore, root}
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
    const root = Mam.getRoot(stateToStore)

    stateToStore.seed = Utils.aes256encrypt(stateToStore.seed, encryptionKey)
    if (stateToStore.channel.side_key)
      stateToStore.channel.side_key = Utils.aes256encrypt(stateToStore.channel.side_key, encryptionKey)

    mamChannels[currentAccount.id]['owner'][id] = { ...stateToStore, root }
    
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

    const root = Mam.getRoot(state)

    return {
      success: true,
      data: root
    }
  }

  create(state, message) {
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
    
    if (state.channel.side_key)
      state.channel.side_key = Utils.aes256decrypt(encryptedState.channel.side_key, encryptionKey)

    const mamMessage = Mam.create(state, message)
    
    mamMessage.state.seed = Utils.sha256(state.seed)
    delete mamMessage.state.channel.side_key
    
    return {
      success: true,
      data: mamMessage
    }
  }

  decode (payload, root) {
    const encryptionKey = this.walletController.getKey()
    const mamChannels = this.storageController.getMamChannels()
    const currentAccount = this.walletController.getCurrentAccount()

    const userMamChannels = mamChannels[currentAccount.id]

    let foundRoot = null
    let foundSideKey = null
    for (let state of Object.values(userMamChannels.owner)) {
      if (state.root === root) {
        foundRoot = root
        foundSideKey = state.channel.side_key
      }
    }

    if (!foundRoot) {
      if (!mamChannels[currentAccount.id].subscriber){
        mamChannels[currentAccount.id]['subscriber'] = {}
      } else {
        for (let state of Object.values(userMamChannels.subscriber)) {
          if (state.root === root) {
            foundRoot = root
            foundSideKey = state.channel.side_key
          }
        }
      }
    }

    let state = null
    if (foundRoot) {
      //private or public channel stored

      state = Mam.decode(payload, null, root)
    } else if (foundSideKey && foundRoot) {
      //restricted channel stored

      const decryptedSideKey = Utils.aes256decrypt(foundSideKey, encryptionKey)
      state = Mam.decode(payload, decryptedSideKey, foundRoot)
    } else {
      //private or public channel not store but since they don't need of side_key, the channel can be fetched

      state = Mam.decode(payload, null, root)
    }
    
    console.log(state)

    /*if (foundRoot) {
      //TODO: store
    } else {

      if (!foundSideKey) {
        return {
          success: false,
          error: 'Root Not Found. Please use storeRoot(...) for storing the root within Pegasus'
        }
      }
      //console.log(Mam.decode('9999', foundSideKey, 'AUEJLPKHDUUKIWCTMALOYQIFGXA9RIRKEGDPCYCIQTYNICLT9ALQGXJFOOXUTKUQJAUUZDQCXNEDEUOLG'))
    }*/

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
