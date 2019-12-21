export default {
  init (duplex) {
    this.duplex = duplex
  },

  isWalletSetup () {
    return this.duplex.send('isWalletSetup')
  },

  setupWallet () {
    return this.duplex.send('setupWallet')
  },

  storePassword (psw) {
    return this.duplex.send('storePassword', psw)
  },

  setPassword (psw) {
    return this.duplex.send('setPassword', psw)
  },

  comparePassword (psw) {
    return this.duplex.send('comparePassword', psw)
  },

  unlockWallet (psw) {
    return this.duplex.send('unlockWallet', psw)
  },

  restoreWallet (account, network, key) {
    return this.duplex.send('restoreWallet', { account, network, key})
  },

  setStorageKey (key) {
    return this.duplex.send('setStorageKey', key)
  },

  writeOnLocalStorage () {
    return this.duplex.send('writeOnLocalStorage')
  },

  unlockSeed (psw) {
    return this.duplex.send('unlockSeed', psw)
  },

  setCurrentNetwork (network) {
    return this.duplex.send('setCurrentNetwork', network)
  },

  addNetwork (network) {
    return this.duplex.send('addNetwork', network)
  },

  getCurrentNetwork () {
    return this.duplex.send('getCurrentNetwork')
  },

  getAllNetworks () {
    return this.duplex.send('getAllNetworks')
  },

  deleteCurrentNetwork () {
    return this.duplex.send('deleteCurrentNetwork')
  },

  addAccount (account, isCurrent) {
    return this.duplex.send('addAccount', { account, isCurrent })
  },

  isAccountNameAlreadyExists (name) {
    return this.duplex.send('isAccountNameAlreadyExists', { name })
  },

  setCurrentAccount (currentAccount) {
    return this.duplex.send('setCurrentAccount', { currentAccount })
  },

  resetData () {
    return this.duplex.send('resetData')
  },

  updateDataAccount (newData) {
    return this.duplex.send('updateDataAccount', { newData })
  },

  updateNameAccount (current, newName) {
    return this.duplex.send('updateNameAccount', { current, newName })
  },

  deleteAccount (account) {
    return this.duplex.send('deleteAccount', { account })
  },

  getCurrentAccount () {
    return this.duplex.send('getCurrentAccount')
  },

  getAllAccounts () {
    return this.duplex.send('getAllAccounts')
  },

  generateSeed (length) {
    return this.duplex.send('generateSeed', length)
  },

  isSeedValid (seed) {
    return this.duplex.send('isSeedValid', seed)
  },

  startSession () {
    return this.duplex.send('startSession')
  },

  checkSession () {
    return this.duplex.send('checkSession')
  },

  deleteSession (seed) {
    return this.duplex.send('deleteSession', seed)
  },

  getState () {
    return this.duplex.send('getState')
  },

  setState (state) {
    return this.duplex.send('setState', state)
  },

  pushTransfersFromPopup (transfer) {
    return this.duplex.send('pushTransfersFromPopup', transfer)
  },

  startHandleAccountData () {
    return this.duplex.send('startHandleAccountData')
  },

  stopHandleAccountData () {
    return this.duplex.send('stopHandleAccountData')
  },

  loadAccountData () {
    return this.duplex.send('loadAccountData')
  },

  reloadAccountData () {
    return this.duplex.send('reloadAccountData')
  },

  openPopup () {
    return this.duplex.send('openPopup')
  },

  closePopup () {
    return this.duplex.send('closePopup')
  },

  executeRequests () {
    return this.duplex.send('executeRequests')
  },

  getConnection (connection) {
    return this.duplex.send('getConnection', connection)
  },

  pushConnection (connection) {
    return this.duplex.send('pushConnection', connection)
  },

  updateConnection (connection) {
    return this.duplex.send('updateConnection', connection)
  },

  completeConnection () {
    return this.duplex.send('completeConnection')
  },

  rejectConnection () {
    return this.duplex.send('rejectConnection')
  },

  startFetchMam (options) {
    return this.duplex.send('startFetchMam', options)
  },

  registerMamChannel (channel) {
    return this.duplex.send('registerMamChannel', channel)
  },

  getMamChannels () {
    return this.duplex.send('getMamChannels')
  },

  getWebsite() {
    return this.duplex.send('getWebsite')
  },

  getRequests () {
    return this.duplex.send('getRequests')
  },

  getRequestsWithUserInteraction () {
    return this.duplex.send('getRequestsWithUserInteraction')
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

  executeRequestFromPopup(request) {
    return this.duplex.send('executeRequestFromPopup', request)
  },

  logout() {
    return this.duplex.send('logout')
  }
}
