// class used to encrypt the content of wallet data in order to make more difficult the decryption of the seed since is encrypted togheter with other data (ex name, address ecc)
// options, state, password hash and session(timestamp for checking the last login) are not encrypted
import Utils from '@pegasus/utils/utils'
import configs from '@pegasus/utils/options'
import { Store } from 'rxjs-observable-store'

const withinData = ['accounts', 'mamChannels', 'connections']

const storageKeys = {
  data: 'PEGASUS_DATA',
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
      hide0Txs: false,
      autoPromotion: {
        emabled: false,
        time: 0
      }
    }
    ;(this.state = 0),
      (this.data = {
        accounts: [],
        connections: [],
        mamChannels: {}
      })
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

    const data = this._loadFromStorage()
    if (data) {
      this.setState(data)
      this.toLoadFromStorage = true
    } else this.toLoadFromStorage = false

    //NOTE: in order to keep a global state for the popup (for the future)
    this.state$.subscribe(_state => {
      //backgroundMessanger.changeGlobalState(_state)
      console.log(_state)
    })

    this.unlocked = false
  }

  _loadFromStorage() {
    const data = localStorage.getItem('PEGASUS_DATA')
    const hpsw = localStorage.getItem('PEGASUS_HPSW')
    const configs = localStorage.getItem('PEGASUS_CONFIGS')
    const popupSettings = localStorage.getItem('PEGASUS_POPUP_SETTINGS')
    const state = localStorage.getItem('PEGASUS_STATE')

    const savedState = {
      data,
      hpsw: JSON.parse(hpsw),
      configs: JSON.parse(configs),
      popupSettings: JSON.parse(popupSettings),
      state: parseInt(JSON.parse(state))
    }

    return data && hpsw && configs && popupSettings && state ? savedState : null
  }

  _writeToStorage(_key, _value, _encrypt = false) {
    localStorage.setItem(
      _key,
      _encrypt
        ? Utils.aes256encrypt(JSON.stringify(_value), this.encryptionkey)
        : JSON.stringify(_value)
    )
  }

  get(_key) {
    if (this.encryptionkey && !this.unlocked && this.toLoadFromStorage) {
      this.setState({
        ...this.state,
        data: JSON.parse(
          Utils.aes256decrypt(this.state.data, this.encryptionkey)
        )
      })

      this.unlocked = true
      this.toLoadFromStorage = false
    }

    return withinData.includes(_key) ? this.state.data[_key] : this.state[_key]
  }

  set(_key, _data, _writeToStorage) {
    const state = this.state

    withinData.includes(_key)
      ? (state.data[_key] = _data)
      : (state[_key] = _data)

    if (_writeToStorage) {
      if (withinData.includes(_key)) {
        this._writeToStorage(storageKeys[_key], _data, true)
      } else {
        this._writeToStorage(storageKeys[_key], state[_key], false)
      }
    }

    this.setState(state)
  }

  isReady() {
    return this.encryptionkey && this.unlocked ? true : false
  }

  setEncryptionKey(key) {
    this.encryptionkey = key
  }

  lock() {
    if (!this.unlocked) return

    this.writeToStorage()
    this.unlocked = false
    this.encryptionkey = null
  }

  writeToStorage() {
    this._writeToStorage('PEGASUS_DATA', this.state.data, true)
    this._writeToStorage('PEGASUS_HPSW', this.state.hpsw, false)
    this._writeToStorage('PEGASUS_CONFIGS', this.state.configs, false)
    this._writeToStorage(
      'PEGASUS_POPUP_SETTINGS',
      this.state.popupSettings,
      false
    )
    this._writeToStorage('PEGASUS_STATE', this.state.state, false)
  }
}

export default StateStorageController
