export default {
  init(duplex) {
    this.duplex = duplex
  },

  initWallet(psw) {
    return this.duplex.send('initWallet', psw)
  },

  comparePassword(psw) {
    return this.duplex.send('comparePassword', psw)
  },

  unlockWallet(psw) {
    return this.duplex.send('unlockWallet', psw)
  },

  restoreWallet(account, password) {
    return this.duplex.send('restoreWallet', { account, password })
  },

  unlockSeed(psw) {
    return this.duplex.send('unlockSeed', psw)
  },

  setCurrentNetwork(network) {
    return this.duplex.send('setCurrentNetwork', network)
  },

  addNetwork(network) {
    return this.duplex.send('addNetwork', network)
  },

  getCurrentNetwork() {
    return this.duplex.send('getCurrentNetwork')
  },

  getAllNetworks() {
    return this.duplex.send('getAllNetworks')
  },

  deleteCurrentNetwork() {
    return this.duplex.send('deleteCurrentNetwork')
  },

  addAccount(account, isCurrent) {
    return this.duplex.send('addAccount', { account, isCurrent })
  },

  isAccountNameAlreadyExists(name) {
    return this.duplex.send('isAccountNameAlreadyExists', { name })
  },

  setCurrentAccount(currentAccount) {
    return this.duplex.send('setCurrentAccount', { currentAccount })
  },

  updateDataAccount(newData) {
    return this.duplex.send('updateDataAccount', { newData })
  },

  updateNameAccount(current, newName) {
    return this.duplex.send('updateNameAccount', { current, newName })
  },

  updateAvatarAccount(current, avatar) {
    return this.duplex.send('updateAvatarAccount', { current, avatar })
  },

  deleteAccount(account) {
    return this.duplex.send('deleteAccount', { account })
  },

  getCurrentAccount() {
    return this.duplex.send('getCurrentAccount')
  },

  getAllAccounts() {
    return this.duplex.send('getAllAccounts')
  },

  generateSeed(length) {
    return this.duplex.send('generateSeed', length)
  },

  checkSession() {
    return this.duplex.send('checkSession')
  },

  deleteSession(seed) {
    return this.duplex.send('deleteSession', seed)
  },

  getState() {
    return this.duplex.send('getState')
  },

  setState(state) {
    return this.duplex.send('setState', state)
  },

  reloadAccountData() {
    return this.duplex.send('reloadAccountData')
  },

  closePopup() {
    return this.duplex.send('closePopup')
  },

  pushConnection(connection) {
    return this.duplex.send('pushConnection', connection)
  },

  updateConnection(connection) {
    return this.duplex.send('updateConnection', connection)
  },

  completeConnection() {
    return this.duplex.send('completeConnection')
  },

  rejectConnection() {
    return this.duplex.send('rejectConnection')
  },

  getConnectionRequest() {
    return this.duplex.send('getConnectionRequest')
  },

  startFetchMam(options) {
    return this.duplex.send('startFetchMam', options)
  },

  registerMamChannel(channel) {
    return this.duplex.send('registerMamChannel', channel)
  },

  getMamChannels() {
    return this.duplex.send('getMamChannels')
  },

  getWebsite() {
    return this.duplex.send('getWebsite')
  },

  getRequests() {
    return this.duplex.send('getRequests')
  },

  getExecutableRequests() {
    return this.duplex.send('getExecutableRequests')
  },

  rejectRequests() {
    return this.duplex.send('rejectRequests')
  },

  createSeedVault(password) {
    return this.duplex.send('createSeedVault', password)
  },

  confirmRequest(request) {
    return this.duplex.send('confirmRequest', request)
  },

  rejectRequest(request) {
    return this.duplex.send('rejectRequest', request)
  },

  executeRequest(request) {
    return this.duplex.send('executeRequest', request)
  },

  lockWallet() {
    return this.duplex.send('lockWallet')
  },

  setPopupSettings(settings) {
    return this.duplex.send('setPopupSettings', settings)
  },

  getPopupSettings() {
    return this.duplex.send('getPopupSettings')
  },

  getConnections() {
    return this.duplex.send('getConnections')
  },

  addConnection(connection) {
    return this.duplex.send('addConnection', connection)
  },

  removeConnection(connection) {
    return this.duplex.send('removeConnection', connection)
  },

  enableTransactionsAutoPromotion(time) {
    return this.duplex.send('enableTransactionsAutoPromotion', time)
  },

  disableTransactionsAutoPromotion() {
    return this.duplex.send('disableTransactionsAutoPromotion')
  }
}
