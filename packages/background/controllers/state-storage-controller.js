// class used to encrypt the content of wallet data in order to make more difficult the decryption of the seed since is encrypted togheter with other data (ex name, address ecc)
// options, state, password hash and session(timestamp for checking the last login) are not encrypted
import Utils from '@pegasus/utils/utils'
import configs from '@pegasus/utils/options'
import { Store } from 'rxjs-observable-store'
import extension from 'extensionizer'
import logger from '@pegasus/utils/logger'

const storageKeys = {
  accounts: 'PEGASUS_ACCOUNT',
  mamChannels: 'PEGASUS_MAM_CHANNELS',
  hpsw: 'PEGASUS_HPSW',
  configs: 'PEGASUS_CONFIGS',
  popupSettings: 'PEGASUS_POPUP_SETTINGS',
  state: 'PEGASUS_STATE'
}

//NOTE: init state
class PegasusGlobalState {
  constructor() {
    this.hpsw = null
    this.configs = configs
    this.popupSettings = {
      autoPromotion: {
        emabled: false,
        time: 0
      },
      filters: {
        hide0Txs: false,
        hidePendingTxs: false,
        hideReattachedTxs: false
      }
    }
    this.state = 0
    this.accounts = []
    this.mamChannels = {}
  }
}

class StateStorageController extends Store {
  constructor() {
    super(new PegasusGlobalState())

    //automatic writing (if wallet is unlocked) in storage each minute
    setTimeout(() => {
      if (this.encryptionkey) {
        this.writeToStorage()
      }
    }, 60000)

    //NOTE: in order to keep a global state for the popup (for the future)
    this.state$.subscribe(_state => {
      //backgroundMessanger.changeGlobalState(_state)
      //console.log(_state)
    })

    this.unlocked = false
  }

  isReady() {
    return this.encryptionkey && this.unlocked ? true : false
  }

  setEncryptionKey(key) {
    this.encryptionkey = key
  }

  async _init() {
    const data = await this._loadFromStorage()
    if (data) {
      this.setState(data)
      this.toLoadFromStorage = true
    } else this.toLoadFromStorage = false
  }

  lock() {
    if (!this.unlocked) return

    this.writeToStorage()
    this.unlocked = false
    this.encryptionkey = null
  }

  get(_key) {
    if (this.encryptionkey && !this.unlocked && this.toLoadFromStorage) {
      this.setState({
        ...this.state,
        accounts: JSON.parse(
          Utils.aes256decrypt(this.state.accounts, this.encryptionkey)
        ),
        mamChannels: JSON.parse(
          Utils.aes256decrypt(this.state.mamChannels, this.encryptionkey)
        )
      })

      this.unlocked = true
      this.toLoadFromStorage = false
    }

    return this.state[_key]
  }

  set(_key, _data, _writeToStorage) {
    const state = this.state

    state[_key] = _data

    this.setState(state)
  }

  reset() {
    //keep the psw
    this.setState({
      ...this.state,
      popupSettings: {
        autoPromotion: {
          emabled: false,
          time: 0
        },
        filters: {
          hide0Txs: false,
          hidePendingTxs: false,
          hideReattachedTxs: false
        }
      },
      accounts: [],
      mamChannels: {}
    })

    this.writeToStorage()
  }

  async _loadFromStorage() {
    const accounts = await this._get('PEGASUS_ACCOUNTS')
    const mamChannels = await this._get('PEGASUS_MAM_CHANNELS')
    const hpsw = await this._get('PEGASUS_HPSW')
    const configs = await this._get('PEGASUS_CONFIGS')
    const popupSettings = await this._get('PEGASUS_POPUP_SETTINGS')
    const state = await this._get('PEGASUS_STATE')

    const savedState = {
      accounts, //still encryped
      mamChannels, //still encryped
      hpsw: JSON.parse(hpsw),
      configs: JSON.parse(configs),
      popupSettings: JSON.parse(popupSettings),
      state: parseInt(JSON.parse(state))
    }

    logger.log(
      `(StateStorageController) Loaded from storage`
    )

    return accounts && mamChannels && hpsw && configs && popupSettings && state ? savedState : null
  }

  async writeToStorage() {
    await this._set({
      PEGASUS_ACCOUNTS: Utils.aes256encrypt(JSON.stringify(this.state.accounts))
    }, this.encryptionkey)

    await this._set({
      PEGASUS_MAM_CHANNELS: Utils.aes256encrypt(JSON.stringify(this.state.mamChannels))
    }, this.encryptionkey)

    await this._set({
      PEGASUS_HPSW: JSON.stringify(this.state.hpsw)
    }, this.encryptionkey)

    await this._set({
      PEGASUS_CONFIGS: JSON.stringify(this.state.configs)
    }, this.encryptionkey)

    await this._set({
      PEGASUS_POPUP_SETTINGS: JSON.stringify(this.state.popupSettings)
    }, this.encryptionkey)

    await this._set({
      PEGASUS_STATE: JSON.stringify(this.state.state)
    }, this.encryptionkey)

    logger.log(
      `(StateStorageController) Written to storage`
    )
  }

  _get(_key) {
    return new Promise((resolve, reject) => {
      extension.storage.local.get(_key, (result) => {
        const err = this._checkForError()
        if (err) {
          reject(err)
        } else {
          resolve(result)
        }
      })
    })
  }

  _set(_value) {
    return new Promise((resolve, reject) => {
      extension.storage.local.set(_value, (result) => {
        const err = this._checkForError()
        if (err) {
          reject(err)
        } else {
          resolve(result)
        }
      })
    })
  }

  _checkForError () {
    const lastError = extension.runtime.lastError
    if (!lastError) {
      return
    }
    if (lastError.stack && lastError.message) {
      return lastError
    }
    return new Error(lastError.message)
  }
}

export default StateStorageController
