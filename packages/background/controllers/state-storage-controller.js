// class used to encrypt the content of wallet data in order to make more difficult the decryption of the seed since is encrypted togheter with other data (ex name, address ecc)
// options, state, password hash and session(timestamp for checking the last login) are not encrypted
import Utils from '@pegasus/utils/utils'
import configs from '@pegasus/utils/options'
import { Store } from 'rxjs-observable-store'
import logger from '@pegasus/utils/logger'

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

    const data = this.loadFromStorage()
    if (data) {
      this.setState(data)
      this.toLoadFromStorage = true
    } else this.toLoadFromStorage = false

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

  isInitialized() {
    return this.state.accounts.length > 0 // no account = no usage
  }

  lock() {
    if (!this.unlocked) {
      logger.log('(StateStorageController) Protected data already locked')
      return
    }

    this.setState({
      ...this.state,
      accounts: [],
      mamChannels: {}
    })

    this.writeToStorage()
    this.unlocked = false
    this.encryptionkey = null

    logger.log('(StateStorageController) Protected data succesfully locked')
  }

  unlock(_encryptionKey) {
    if (this.unlocked) {
      logger.log('(StateStorageController) Protected data already unlocked')
      return
    }

    this.encryptionkey = _encryptionKey
    this.unlocked = true

    if (!this.isInitialized()) return

    this.setState({
      ...this.state,
      accounts: JSON.parse(
        Utils.aes256decrypt(this.state.accounts, this.encryptionkey)
      ),
      mamChannels: JSON.parse(
        Utils.aes256decrypt(this.state.mamChannels, this.encryptionkey)
      )
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

  loadFromStorage() {
    const accounts = localStorage.getItem('PEGASUS_ACCOUNTS')
    const mamChannels = localStorage.getItem('PEGASUS_MAM_CHANNELS')
    const hpsw = localStorage.getItem('PEGASUS_HPSW')
    const configs = localStorage.getItem('PEGASUS_CONFIGS')
    const popupSettings = localStorage.getItem('PEGASUS_POPUP_SETTINGS')
    const state = localStorage.getItem('PEGASUS_STATE')

    const savedState = {
      accounts, //still encryped
      mamChannels, //still encryped
      hpsw: JSON.parse(hpsw),
      configs: JSON.parse(configs),
      popupSettings: JSON.parse(popupSettings),
      state: parseInt(JSON.parse(state))
    }

    logger.log(`(StateStorageController) Loaded from storage`)

    return accounts && mamChannels && hpsw && configs && popupSettings && state
      ? savedState
      : null
  }

  writeToStorage() {
    console.log(this.state)
    localStorage.setItem(
      'PEGASUS_ACCOUNTS',
      Utils.aes256encrypt(
        JSON.stringify(this.state.accounts),
        this.encryptionkey
      )
    )
    console.log('1')

    localStorage.setItem(
      'PEGASUS_MAM_CHANNELS',
      Utils.aes256encrypt(
        JSON.stringify(this.state.mamChannels),
        this.encryptionkey
      )
    )
    localStorage.setItem(
      'PEGASUS_HPSW',
      JSON.stringify(this.state.hpsw),
      this.encryptionkey
    )
    localStorage.setItem(
      'PEGASUS_CONFIGS',
      JSON.stringify(this.state.configs),
      this.encryptionkey
    )
    localStorage.setItem(
      'PEGASUS_POPUP_SETTINGS',
      JSON.stringify(this.state.popupSettings)
    )
    localStorage.setItem(
      'PEGASUS_STATE',
      JSON.stringify(this.state.state),
      this.encryptionkey
    )

    logger.log(`(StateStorageController) Written to storage`)
  }
}

export default StateStorageController
