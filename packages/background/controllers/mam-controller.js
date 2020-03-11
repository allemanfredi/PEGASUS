import Mam from '@iota/mam/lib/mam.web.min.js'
import { trytesToAscii } from '@iota/converter'
import Utils from '@pegasus/utils/utils'
import { backgroundMessanger } from '@pegasus/utils/messangers'

class MamController {
  constructor(options) {
    const { stateStorageController } = options

    this.stateStorageController = stateStorageController
  }

  setNetworkController(_networkController) {
    this.networkController = _networkController
  }

  setWalletController(_walletController) {
    this.walletController = _walletController
  }

  init(security = 2) {
    const network = this.networkController.getCurrentNetwork()

    //if i put seed = null (as specified in the doc) doesn't work
    const state = Mam.init(network.provider)
    const root = Mam.getRoot(state)

    const id = Utils.sha256(state.seed)

    const mamChannels = this.stateStorageController.get('mamChannels')
    const currentAccount = this.walletController.getCurrentAccount()

    //encrypt the channel seed in order to not store it in plain text
    const stateToStore = Utils.copyObject(state)

    if (!mamChannels[currentAccount.id]) {
      mamChannels[currentAccount.id] = {
        owner: {}
      }
    }

    mamChannels[currentAccount.id]['owner'][id] = { ...stateToStore, root }
    this.stateStorageController.set('mamChannels', mamChannels)

    state.seed = Utils.sha256(state.seed)
    delete state.channel.side_key

    return {
      success: true,
      data: state
    }
  }

  changeMode(_state, _mode, _sidekey = null) {
    const id = _state.seed

    const mamChannels = this.stateStorageController.get('mamChannels')
    const currentAccount = this.walletController.getCurrentAccount()

    if (!mamChannels[currentAccount.id]['owner'][id]) {
      return {
        success: false,
        error: 'Channel Not Found'
      }
    }

    const _storedState = mamChannels[currentAccount.id]['owner'][id]
    _state.seed = _storedState.seed
    if (_storedState.channel.side_key)
      _state.channel.side_key = _storedState.side_key

    const stateToStore = Mam.changeMode(_state, _mode, _sidekey)

    const root = Mam.getRoot(stateToStore)

    stateToStore.seed = _storedState.seed

    if (_mode == 'public' || _mode == 'private')
      stateToStore.channel.side_key = null

    let sideKeyToReturn = null
    if (stateToStore.channel.side_key) {
      sideKeyToReturn = Utils.sha256(stateToStore.channel.side_key)
    }

    mamChannels[currentAccount.id]['owner'][id] = { ...stateToStore, root }

    this.stateStorageController.set('mamChannels', mamChannels)

    const stateToReturn = Utils.copyObject(stateToStore)
    stateToReturn.seed = id
    stateToReturn.channel.side_key = sideKeyToReturn

    console.log(stateToReturn)

    return {
      success: true,
      data: stateToReturn
    }
  }

  getRoot(_state) {
    const id = _state.seed

    const mamChannels = this.stateStorageController.get('mamChannels')
    const currentAccount = this.walletController.getCurrentAccount()

    if (!mamChannels[currentAccount.id]['owner'][id]) {
      return {
        success: false,
        error: 'Channel Not Found'
      }
    }

    const storedState = mamChannels[currentAccount.id]['owner'][id]
    _state.seed = storedState.seed

    const root = Mam.getRoot(_state)

    return {
      success: true,
      data: root
    }
  }

  create(_state, message) {
    const id = _state.seed

    const mamChannels = this.stateStorageController.get('mamChannels')
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

    const storedState = mamChannels[currentAccount.id]['owner'][id]
    _state.seed = storedState.seed

    let sideKeyToReturn = null
    if (_state.channel.side_key) {
      _state.channel.side_key = storedState.channel.side_key
      sideKeyToReturn = Utils.sha256(_state.channel.side_key)
    }

    const mamMessage = Mam.create(_state, message)

    mamMessage.state.seed = Utils.sha256(_state.seed)
    mamMessage.state.channel.side_key = sideKeyToReturn

    console.log(mamMessage)

    return {
      success: true,
      data: mamMessage
    }
  }

  decode(_payload, _root) {
    const mamChannels = this.stateStorageController.get('mamChannels')
    const currentAccount = this.walletController.getCurrentAccount()

    if (!mamChannels[currentAccount.id]) {
      mamChannels[currentAccount.id] = {
        subscriber: {},
        owner: {}
      }
      this.stateStorageController.set('mamChannels', mamChannels)
      return {
        success: false,
        error: 'Channel Not Found'
      }
    }

    if (!mamChannels[currentAccount.id]['subscriber']) {
      mamChannels[currentAccount.id]['subscriber'] = {}
    }

    if (!mamChannels[currentAccount.id]['owner']) {
      mamChannels[currentAccount.id]['owner'] = {}
    }

    const userMamChannels = mamChannels[currentAccount.id]

    const sidekey = this._searchSidekeyIntoUserChannelsByRoot(
      userMamChannels,
      _root
    )
    const foundRoot = this._searchRootIntoUserChannels(userMamChannels, _root)

    const state = Mam.decode(
      _payload,
      sidekey && foundRoot ? sidekey : null,
      _root
    )

    if (state.channel.side_key) {
      state.channel.side_key = Utils.sha256(state.channel.side_key)
    }
    if (state.seed) {
      state.seed = Utils.sha256(state.seed)
    }

    return {
      success: true,
      data: state
    }
  }

  attach(_payload, _root, _depth = 3, _minWeightMagnitude = 9, _tag = null) {
    return new Promise(async resolve => {
      const network = this.networkController.getCurrentNetwork()
      Mam.init(network.provider)
      Mam.attach(_payload, _root, _depth, _minWeightMagnitude, _tag)
        .then(data =>
          resolve({
            success: true,
            data
          })
        )
        .catch(error =>
          resolve({
            success: false,
            error: error.message
          })
        )
    })
  }

  fetch(_root, _mode, _options, _limit = null) {
    return new Promise(async resolve => {
      const network = this.networkController.getCurrentNetwork()
      Mam.init(network.provider)

      let sidekey = null

      if (_mode === 'restricted') {
        const mamChannels = this.stateStorageController.get('mamChannels')
        const currentAccount = this.walletController.getCurrentAccount()

        if (!mamChannels[currentAccount.id].subscriber) {
          mamChannels[currentAccount.id]['subscriber'] = {}
        }

        sidekey = this._searchSidekeyIntoUserChannelsByRoot(
          mamChannels[currentAccount.id],
          _root
        )

        if (!sidekey) {
          sidekey = await this._bruteForceToFindSidekeyCorrespondingToChildStoredRoot(
            Mam,
            mamChannels[currentAccount.id],
            _root
          )
        }

        if (!sidekey)
          resolve({
            success: false,
            data: `Sidekey Not Found for ${_root}`
          })
        return
      }

      const packets = await Mam.fetch(
        _root,
        _mode,
        sidekey,
        e => {
          console.log(e)
          if (_options.reply) {
            backgroundMessanger.sendToContentScript('mam_onFetch', {
              data: e,
              uuid: _options.uuid
            })
          }
        },
        _limit
      )

      resolve({
        success: true,
        data: packets
      })
    })
  }

  fetchSingle(_root, _mode) {
    return this.fetch(
      _root,
      _mode,
      {
        reply: null
      },
      1
    )
  }

  //TODO: subscribe and listen

  //to find sidekey for a root which is not stored but belongs to a stored root
  async _bruteForceToFindSidekeyCorrespondingToChildStoredRoot(
    _mam,
    _userMamChannels,
    _root
  ) {
    let foundSideKey = null
    for (let state of Object.values(_userMamChannels.owner)) {
      if (state.channel.mode === 'restricted') {
        foundSideKey = state.channel.side_key
        const packet = await _mam.fetchSingle(
          _root,
          'restricted',
          state.channel.side_key
        )

        if (!Utils.isError(packet)) {
          break
        }
        foundSideKey = null
      }
    }

    if (foundSideKey) {
      return foundSideKey
    }

    for (let state of Object.values(_userMamChannels.subscriber)) {
      if (state.channel.mode === 'restricted') {
        foundSideKey = state.channel.side_key
        const packet = await _mam.fetchSingle(
          _root,
          'restricted',
          state.channel.side_key
        )

        if (!Utils.isError(packet)) {
          break
        }
        foundSideKey = null
      }
    }

    return foundSideKey
  }

  _searchSidekeyIntoUserChannelsByRoot(_userMamChannels, _root) {
    let sidekey = null
    for (let state of Object.values(_userMamChannels.owner)) {
      if (state.root === _root) {
        sidekey = state.channel.side_key
      }
    }

    if (sidekey) {
      return sidekey
    }

    for (let state of Object.values(_userMamChannels.subscriber)) {
      if (state.root === _root) {
        sidekey = state.channel.side_key
      }
    }

    return sidekey
  }

  _searchRootIntoUserChannels(userMamChannels, _root) {
    let foundRoot = null
    for (let state of Object.values(userMamChannels.owner)) {
      if (state.root === _root) {
        foundRoot = state.root
      }
    }

    if (foundRoot) {
      return foundRoot
    }

    for (let state of Object.values(userMamChannels.subscriber)) {
      if (state.root === _root) {
        foundRoot = state.root
      }
    }

    return foundRoot
  }

  fetchFromPopup(_provider, _root, _mode, _sidekey, _callback) {
    try {
      Mam.init(_provider)
      Mam.fetch(_root, _mode, _sidekey, event => {
        _callback(JSON.parse(trytesToAscii(event)))
      })
    } catch (error) {
      console.log('MAM fetch error', error)
    }
  }

  /*
    channel = {
      side_key: null,
      mode: 'public',
      next_root: null,
      security,
      start: 0,
      count: 1,
      next_count: 1,
      index: 0
    }
  */
  registerMamChannel(_channel) {
    const mamChannels = this.stateStorageController.get('mamChannels')
    const currentAccount = this.walletController.getCurrentAccount()

    if (!mamChannels[currentAccount.id]) {
      mamChannels[currentAccount.id] = {
        subscriber: {},
        owner: {}
      }
    }

    if (!mamChannels[currentAccount.id].subscriber) {
      mamChannels[currentAccount.id]['subscriber'] = {}
    }

    const id = Utils.sha256(_channel.root)
    mamChannels[currentAccount.id]['subscriber'][id] = {
      channel: {
        side_key: _channel.sidekey,
        mode: _channel.mode
      },
      root: _channel.root
    }

    this.stateStorageController.set('mamChannels', mamChannels)
    return true
  }

  getMamChannels() {
    const mamChannels = this.stateStorageController.get('mamChannels')
    const currentAccount = this.walletController.getCurrentAccount()
    return mamChannels[currentAccount.id]
  }
}

export default MamController
