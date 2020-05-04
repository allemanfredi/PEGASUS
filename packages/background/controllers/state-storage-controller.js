// class used to encrypt the content of wallet data in order to make more difficult the decryption of the seed since is encrypted togheter with other data (ex name, address ecc)
// options, state, password hash and session(timestamp for checking the last login) are not encrypted
import { Store } from 'rxjs-observable-store'
import logger from '@pegasus/utils/logger'
import { encrypt, decrypt } from '../lib/browser-protector'
import ExtensionStore from '../lib/extension-store'
import { APP_STATE } from '@pegasus/utils/states'
import { PegasusGlobalState, resetState } from '../lib/global-state'
import options from '@pegasus/utils/options'

class StateStorageController extends Store {
  constructor() {
    super(new PegasusGlobalState())

    this.unlocked = false
    this.storage = new ExtensionStore()

    /* chrome.storage.local.clear(function() {
      var error = chrome.runtime.lastError
      if (error) {
        console.error(error)
      }
    }) */

    this._init()
  }

  /**
   *
   * Load data from the storage (internal function)
   */
  async _init() {
    const data = await this._loadFromStorage()
    if (data) this.setState(data)
  }

  /**
   *
   * Function used to check if the wallet is ready
   */
  isReady() {
    return Boolean(this.encryptionkey && this.unlocked)
  }

  /**
   *
   * Function to check if the wallet is initialized
   */
  isInitialized() {
    return this.state.accounts.length > 0 // no account = no usage
  }

  /**
   *
   * Write data to the storage with the current encryption key and delete it
   */
  async lock() {
    if (!this.unlocked) {
      logger.log('(StateStorageController) Protected data already locked')
      return
    }

    const encryptedData = await encrypt(this.encryptionkey, {
      accounts: this.state.accounts
    })

    this.setState({
      ...this.state,
      accounts: [],
      data: encryptedData
    })

    await this._writeToStorage()

    this.unlocked = false
    this.encryptionkey = null
    this._toLoadFromStorage = true

    logger.log('(StateStorageController) Protected data succesfully locked')
  }

  /**
   *
   * Init the global state by loading data from the storage
   * decrypting them with _encryptionKey
   */
  init(_encryptionKey) {
    this.encryptionkey = _encryptionKey
    this.unlocked = true
    logger.log('(StateStorageController) Initialized succesfully')
  }

  /**
   *
   * Decrypt the data for example when a user log in
   * into the wallet
   *
   * @param {String} _encryptionKey
   */
  async unlock(_encryptionKey) {
    if (this.unlocked) {
      logger.log('(StateStorageController) Protected data already unlocked')
      return
    }

    this.encryptionkey = _encryptionKey
    this.unlocked = true

    const decryptedData = await decrypt(this.encryptionkey, this.state.data)

    const { accounts } = decryptedData

    this.setState({
      ...this.state,
      accounts,
      data: null
    })
  }

  /**
   *
   * Get the corresponding value to _key
   *
   * @param {String} _key
   */
  get(_key) {
    return this.state[_key]
  }

  /**
   *
   * Set _data corresponding to _key
   *
   * @param {Key} _key
   * @param {Any} _data
   */
  set(_key, _data) {
    const state = this.state

    state[_key] = _data

    this.setState(state)
  }

  /**
   *
   * Reset the state and write it into the storage
   */
  async reset() {
    this.setState({
      ...this.state,
      ...resetState
    })

    await this._writeToStorage()
  }

  /**
   *
   * Internal function used to read all data from the storage
   */
  async _loadFromStorage() {
    const storedData = await this.storage.get()
    if (!storedData) return null

    // NOTE: adds comnet support into previous versions <= 0.10.0 (will be removed in 0.12.0)
    const comnet = options.networks[1]
    const comnetExists = storedData['PEGASUS_NETWORKS'].find(
      _network => _network.name === comnet.name && _network.default
    )

    if (!comnetExists) {
      storedData['PEGASUS_NETWORKS'].splice(1, 0, comnet)
    }

    const savedState = {
      data: storedData['PEGASUS_DATA'], // still encrypted
      hpsw: storedData['PEGASUS_HPSW'],
      settings: storedData['PEGASUS_POPUP_SETTINGS'],
      selectedNetwork: storedData['PEGASUS_SELECTED_NETWORK'],
      networks: storedData['PEGASUS_NETWORKS'],
      state: APP_STATE.WALLET_LOCKED // in order to start from login
    }

    logger.log('(StateStorageController) Loaded from storage')

    return savedState
  }

  /**
   *
   * Internal function user to write all data into the storage
   */
  async _writeToStorage() {
    await this.storage.set({ PEGASUS_DATA: this.state.data })
    await this.storage.set({ PEGASUS_HPSW: this.state.hpsw })
    await this.storage.set({
      PEGASUS_SELECTED_NETWORK: this.state.selectedNetwork
    })
    await this.storage.set({ PEGASUS_NETWORKS: this.state.networks })
    await this.storage.set({ PEGASUS_POPUP_SETTINGS: this.state.settings })

    logger.log('(StateStorageController) Written to storage')
  }
}

export default StateStorageController
