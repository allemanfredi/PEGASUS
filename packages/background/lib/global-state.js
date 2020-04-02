import configs from '@pegasus/utils/options'

const DEFAULT_LOCKING_TIME = 60 //60 minutes

const availablesCurrencies = [
  {
    value: 'USD',
    symbol: '$'
  },
  {
    value: 'EUR',
    symbol: '€'
  },
  {
    value: 'GBP',
    symbol: '£'
  },
  {
    value: 'CHF',
    symbol: 'Fr.'
  }
]

/**
 * Default class that implements the global state
 */
export class PegasusGlobalState {
  constructor() {
    this.hpsw = null
    this.selectedNetwork = configs.networks[0]
    this.networks = configs.networks
    this.settings = {
      currencies: {
        selected: availablesCurrencies[0],
        all: availablesCurrencies
      },
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

/**
 * object used when user reset the wallet
 */
export const resetState = {
  settings: {
    currencies: {
      selected: availablesCurrencies[0],
      all: availablesCurrencies
    },
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
