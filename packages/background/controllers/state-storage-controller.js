// class used to encrypt the content of wallet data in order to make more difficult the decryption of the seed since is encrypted togheter with other data (ex name, address ecc)
// options, state, password hash and session(timestamp for checking the last login) are not encrypted
import { Store } from 'rxjs-observable-store'
import logger from '@pegasus/utils/logger'
import { encrypt, decrypt } from '../lib/browser-protector'
import ExtensionStore from '@pegasus/utils/extension-store'
import { APP_STATE } from '@pegasus/utils/states'
import { PegasusGlobalState, resetState } from '../lib/global-state'

class StateStorageController extends Store {
  constructor() {
    super(new PegasusGlobalState())

    this.unlocked = false
    this.storage = new ExtensionStore()

    /*chrome.storage.local.clear(function() {
      var error = chrome.runtime.lastError
      if (error) {
        console.error(error)
      }
    })*/

    this._init()
  }

  async _init() {
    const data = await this._loadFromStorage()
    if (data) {
      this.setState(data)
    }
  }

  isReady() {
    return this.encryptionkey && this.unlocked ? true : false
  }

  isInitialized() {
    return this.state.accounts.length > 0 // no account = no usage
  }

  async lock() {
    if (!this.unlocked) {
      logger.log('(StateStorageController) Protected data already locked')
      return
    }

    const encryptedData = await encrypt(this.encryptionkey, {
      accounts: this.state.accounts,
      mamChannels: this.state.mamChannels
    })

    this.setState({
      ...this.state,
      accounts: [],
      mamChannels: {},
      data: encryptedData
    })

    await this._writeToStorage()

    this.unlocked = false
    this.encryptionkey = null
    this._toLoadFromStorage = true

    logger.log('(StateStorageController) Protected data succesfully locked')
  }

  init(_encryptionKey) {
    this.encryptionkey = _encryptionKey
    this.unlocked = true
    logger.log('(StateStorageController) Initialized succesfully')
  }

  async unlock(_encryptionKey) {
    if (this.unlocked) {
      logger.log('(StateStorageController) Protected data already unlocked')
      return
    }

    this.encryptionkey = _encryptionKey
    this.unlocked = true

    const decryptedData = await decrypt(this.encryptionkey, this.state.data)

    const { accounts, mamChannels } = decryptedData

    this.setState({
      ...this.state,
      accounts,
      mamChannels,
      data: null
    })
  }

  get(_key) {
    return this.state[_key]
  }

  set(_key, _data) {
    const state = this.state

    state[_key] = _data

    this.setState(state)
  }

  async reset() {
    this.setState({
      ...this.state,
      ...resetState
    })

    await this._writeToStorage()
  }

  async _loadFromStorage() {
    const storedData = await this.storage.get()
    if (!storedData) return null

    const savedState = {
      data: storedData['PEGASUS_DATA'], //still encrypted
      hpsw: storedData['PEGASUS_HPSW'],
      popupSettings: storedData['PEGASUS_POPUP_SETTINGS'],
      selectedNetwork: storedData['PEGASUS_SELECTED_NETWORK'],
      networks: storedData['PEGASUS_NETWORKS'],
      state: APP_STATE.WALLET_LOCKED //in order to start from login
    }

    logger.log(`(StateStorageController) Loaded from storage`)

    return savedState
  }

  async _writeToStorage() {
    await this.storage.set({ PEGASUS_DATA: this.state.data })
    await this.storage.set({ PEGASUS_HPSW: this.state.hpsw })
    await this.storage.set({
      PEGASUS_SELECTED_NETWORK: this.state.selectedNetwork
    })
    await this.storage.set({ PEGASUS_NETWORKS: this.state.networks })
    await this.storage.set({ PEGASUS_POPUP_SETTINGS: this.state.popupSettings })

    logger.log(`(StateStorageController) Written to storage`)
  }
}

export default StateStorageController
