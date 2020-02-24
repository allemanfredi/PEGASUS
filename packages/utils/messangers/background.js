export default {
  init(duplex) {
    this.duplex = duplex
  },

  setRequests(requests) {
    this.duplex.send('popup', 'setRequests', requests, false)
  },

  setNetworks(networks) {
    this.duplex.send('popup', 'setNetworks', networks, false)
  },

  setNetwork(network) {
    this.duplex.send('popup', 'setNetwork', network, false)
  },

  setTransfersConfirmationLoading(loading) {
    this.duplex.send('popup', 'setTransfersConfirmationLoading', loading, false)
  },

  setTransfersConfirmationError(error) {
    this.duplex.send('popup', 'setTransfersConfirmationError', error, false)
  },

  setAccount(account) {
    this.duplex.send('popup', 'setAccount', account, false)
  },

  newMamData(data) {
    this.duplex.send('popup', 'newMamData', data, false)
  },

  setAppState(state) {
    this.duplex.send('popup', 'setAppState', state, false)
  },

  setSelectedProvider(provider) {
    this.duplex.send(
      'tab',
      'tunnel',
      {
        action: 'setSelectedProvider',
        data: provider
      },
      false
    )
  },

  setSelectedAccount(account) {
    this.duplex.send(
      'tab',
      'tunnel',
      {
        action: 'setSelectedAccount',
        data: account
      },
      false
    )
  },

  sendToContentScript(action, data) {
    this.duplex.send(
      'tab',
      'tunnel',
      {
        action,
        data
      },
      false
    )
  }
}
