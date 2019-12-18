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

    //if i put seed = null (as specified in the doc) doesn't work
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

    if (mode == 'public' || mode == 'private')
      stateToStore.channel.side_key = null
    
    let sideKeyToReturn = null
    if (stateToStore.channel.side_key) {
      sideKeyToReturn = Utils.sha256(stateToStore.channel.side_key)
      stateToStore.channel.side_key = Utils.aes256encrypt(stateToStore.channel.side_key, encryptionKey)
    }

    mamChannels[currentAccount.id]['owner'][id] = { ...stateToStore, root }
    
    this.storageController.setMamChannels(mamChannels, true)

    const stateToReturn = Utils.copyObject(stateToStore)
    stateToReturn.seed = id
    stateToReturn.channel.side_key = sideKeyToReturn

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

    if (state.channel.side_key)
      state.channel.side_key = Utils.aes256decrypt(state.channel.side_key, encryptionKey)
    
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

    if (!mamChannels[currentAccount.id]) {
      return {
        success: false,
        error: 'Channel Not Found'
      }
    }

    if (!mamChannels[currentAccount.id]['owner'][id]) {
      return {
        success: false,
        error: 'Channel Not Found'
      }
    }

    const encryptedState = mamChannels[currentAccount.id]['owner'][id]
    state.seed = Utils.aes256decrypt(encryptedState.seed, encryptionKey)
    
    let sideKeyToReturn = null
    if (state.channel.side_key) {
      state.channel.side_key = Utils.aes256decrypt(encryptedState.channel.side_key, encryptionKey)
      sideKeyToReturn = Utils.sha256(state.channel.side_key)
    }

    const mamMessage = Mam.create(state, message)
    
    mamMessage.state.seed = Utils.sha256(state.seed)
    mamMessage.state.channel.side_key = sideKeyToReturn
    
    return {
      success: true,
      data: mamMessage
    }
  }

  attach (payload, root, depth = 3, minWeightMagnitude = 9, tag = null) {
    return new Promise((async resolve => {
      const network = this.networkController.getCurrentNetwork()
      Mam.init(network.provider)
      Mam.attach(payload, root, depth, minWeightMagnitude, tag)
        .then(data => resolve({
          success: true,
          data
        }))
        .catch(error => resolve({
          success: false,
          error: error.message
        }))
    }))
  }

  fetch (root, mode, options, limit = null) {
    return new Promise(async resolve => {
      let sidekey = null

      if (mode === 'restricted') {
        const encryptionKey = this.walletController.getKey()
        const mamChannels = this.storageController.getMamChannels()
        const currentAccount = this.walletController.getCurrentAccount()
        
        if (!mamChannels[currentAccount.id].subscriber){
          mamChannels[currentAccount.id]['subscriber'] = {}
        }

        sidekey = this._searchSidekeyIntoUserChannelsByRoot(
          mamChannels[currentAccount.id],
          root
        )

        if (sidekey) {
          sidekey = Utils.aes256decrypt(sidekey, encryptionKey)
        } else {
          resolve({
            success: false,
            data: `Sidekey Not Found for ${root}`
          })
          return
        }
      }

      const network = this.networkController.getCurrentNetwork()
      Mam.init(network.provider)

      const packets = await Mam.fetch(root, mode, sidekey, e => {
        if (options.reply) {
          backgroundMessanger.sendToContentScript(
            'mam_onFetch',
            {
              data: e,
              uuid: options.uuid
            }
          )
        }
      }, limit)

      resolve({
        success: true,
        data: packets
      })
    })
  }

  _searchSidekeyIntoUserChannelsByRoot (userMamChannels, root) {
    let sidekey = null
    for (let state of Object.values(userMamChannels.owner)) {
      if (state.root === root) {
        sidekey = state.channel.side_key
      }
    }

    if (!sidekey) {
      for (let state of Object.values(userMamChannels.subscriber)) {
        if (state.root === root) {
          sidekey = state.channel.side_key
        }
      }
    }

    return sidekey
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
