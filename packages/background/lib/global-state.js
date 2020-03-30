import configs from '@pegasus/utils/options'

const DEFAULT_LOCKING_TIME = 60 //60 minutes

export class PegasusGlobalState {
  constructor() {
    this.hpsw = null
    this.selectedNetwork = configs.networks[0]
    this.networks = configs.networks
    this.popupSettings = {
      autoPromotion: {
        emabled: false,
        time: 0
      },
      autoLocking: {
        enabled: true,
        time: DEFAULT_LOCKING_TIME
      },
      filters: {
        hide0Txs: false,
        hidePendingTxs: false,
        hideReattachedTxs: false
      }
    }
    this.state = 0
    this.accounts = {
      selected: {},
      all: []
    }
    this.mamChannels = {}
    this.data = null
  }
}

export const resetState = {
  popupSettings: {
    autoPromotion: {
      emabled: false,
      time: 0
    },
    autoLocking: {
      enabled: true,
      time: DEFAULT_LOCKING_TIME
    },
    filters: {
      hide0Txs: false,
      hidePendingTxs: false,
      hideReattachedTxs: false
    }
  },
  accounts: {
    selected: {},
    all: []
  },
  mamChannels: {},
  //used when enctyped
  data: {
    accounts: {
      selected: {},
      all: []
    },
    mamChannels: {}
  }
}
