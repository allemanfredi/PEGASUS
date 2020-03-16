const buildPromisedBackgroundApi = _backgroundConnection => {
  return {
    isWalletSetup: () =>
      new Promise((resolve, reject) =>
        _backgroundConnection.isWalletSetup((res, err) =>
          err ? reject(err) : resolve(res)
        )
      ),

    unlockWallet: password =>
      new Promise((resolve, reject) =>
        _backgroundConnection.unlockWallet(password, (err, res) => {
          err ? reject(err) : resolve(res)
        })
      ),

    lockWallet: () =>
      new Promise((resolve, reject) =>
        _backgroundConnection.lockWallet((err, res) => {
          err ? reject(err) : resolve(res)
        })
      ),

    initWallet: (password, account) =>
      new Promise((resolve, reject) =>
        _backgroundConnection.initWallet(password, account, (err, res) => {
          err ? reject(err) : resolve(res)
        })
      ),

    restoreWallet: (password, account) =>
      new Promise((resolve, reject) =>
        _backgroundConnection.restoreWallet(password, account, (err, res) => {
          err ? reject(err) : resolve(res)
        })
      ),

    unlockSeed: password =>
      new Promise((resolve, reject) =>
        _backgroundConnection.unlockSeed(password, (err, res) => {
          err ? reject(err) : resolve(res)
        })
      ),

    comparePassword: password =>
      new Promise((resolve, reject) =>
        _backgroundConnection.comparePassword(password, (err, res) => {
          err ? reject(err) : resolve(res)
        })
      ),

    setCurrentNetwork: network =>
      new Promise((resolve, reject) =>
        _backgroundConnection.setCurrentNetwork(network, (res, err) =>
          err ? reject(err) : resolve(res)
        )
      ),

    getCurrentNetwork: () =>
      new Promise((resolve, reject) =>
        _backgroundConnection.getCurrentNetwork((res, err) =>
          err ? reject(err) : resolve(res)
        )
      ),

    getAllNetworks: () =>
      new Promise((resolve, reject) =>
        _backgroundConnection.getAllNetworks((res, err) =>
          err ? reject(err) : resolve(res)
        )
      ),

    addNetwork: network =>
      new Promise((resolve, reject) =>
        _backgroundConnection.addNetwork(network, (res, err) =>
          err ? reject(err) : resolve(res)
        )
      ),

    deleteCurrentNetwork: () =>
      new Promise((resolve, reject) =>
        _backgroundConnection.deleteCurrentNetwork((res, err) =>
          err ? reject(err) : resolve(res)
        )
      ),

    addAccount: (account, isCurrent) =>
      new Promise((resolve, reject) =>
        _backgroundConnection.addAccount(account, isCurrent, (err, res) => {
          err ? reject(err) : resolve(res)
        })
      ),

    isAccountNameAlreadyExists: name =>
      new Promise((resolve, reject) =>
        _backgroundConnection.isAccountNameAlreadyExists(name, (res, err) =>
          err ? reject(err) : resolve(res)
        )
      ),

    getCurrentAccount: () =>
      new Promise((resolve, reject) =>
        _backgroundConnection.getCurrentAccount((res, err) =>
          err ? reject(err) : resolve(res)
        )
      ),

    getAllAccounts: () =>
      new Promise((resolve, reject) =>
        _backgroundConnection.getAllAccounts((res, err) =>
          err ? reject(err) : resolve(res)
        )
      ),

    setCurrentAccount: account =>
      new Promise((resolve, reject) =>
        _backgroundConnection.setCurrentAccount(account, (res, err) =>
          err ? reject(err) : resolve(res)
        )
      ),

    updateNameAccount: (account, newName) =>
      new Promise((resolve, reject) =>
        _backgroundConnection.updateNameAccount(account, newName, (res, err) =>
          err ? reject(err) : resolve(res)
        )
      ),

    updateAvatarAccount: (account, avatar) =>
      new Promise((resolve, reject) =>
        _backgroundConnection.updateAvatarAccount(account, avatar, (res, err) =>
          err ? reject(err) : resolve(res)
        )
      ),

    deleteAccount: account =>
      new Promise((resolve, reject) =>
        _backgroundConnection.deleteAccount(account, (res, err) =>
          err ? reject(err) : resolve(res)
        )
      ),

    generateSeed: length =>
      new Promise((resolve, reject) =>
        _backgroundConnection.generateSeed(length, (res, err) =>
          err ? reject(err) : resolve(res)
        )
      ),

    setPopupSettings: settings =>
      new Promise((resolve, reject) =>
        _backgroundConnection.setPopupSettings(settings, (res, err) =>
          err ? reject(err) : resolve(res)
        )
      ),

    getPopupSettings: () =>
      new Promise((resolve, reject) =>
        _backgroundConnection.getPopupSettings((res, err) =>
          err ? reject(err) : resolve(res)
        )
      ),

    checkSession: () =>
      new Promise((resolve, reject) =>
        _backgroundConnection.checkSession((res, err) =>
          err ? reject(err) : resolve(res)
        )
      ),

    deleteSession: () =>
      new Promise((resolve, reject) =>
        _backgroundConnection.deleteSession((res, err) =>
          err ? reject(err) : resolve(res)
        )
      ),

    getState: () =>
      new Promise((resolve, reject) =>
        _backgroundConnection.getState((res, err) =>
          err ? reject(err) : resolve(res)
        )
      ),

    setState: state =>
      new Promise((resolve, reject) =>
        _backgroundConnection.setState(state, (res, err) =>
          err ? reject(err) : resolve(res)
        )
      ),

    closePopup: () =>
      new Promise((resolve, reject) =>
        _backgroundConnection.closePopup((res, err) =>
          err ? reject(err) : resolve(res)
        )
      ),

    executeRequest: request =>
      new Promise((resolve, reject) =>
        _backgroundConnection.executeRequest(request, (err, res) => {
          err ? reject(err) : resolve(res)
        })
      ),

    confirmRequest: request =>
      new Promise((resolve, reject) =>
        _backgroundConnection.confirmRequest(request, (err, res) => {
          err ? reject(err) : resolve(res)
        })
      ),

    getRequests: () =>
      new Promise((resolve, reject) =>
        _backgroundConnection.getRequests((res, err) =>
          err ? reject(err) : resolve(res)
        )
      ),

    getExecutableRequests: () =>
      new Promise((resolve, reject) =>
        _backgroundConnection.getExecutableRequests((res, err) =>
          err ? reject(err) : resolve(res)
        )
      ),

    rejectRequest: request =>
      new Promise((resolve, reject) =>
        _backgroundConnection.rejectRequest(request, (res, err) =>
          err ? reject(err) : resolve(res)
        )
      ),

    rejectRequests: () =>
      new Promise((resolve, reject) =>
        _backgroundConnection.rejectRequests((res, err) =>
          err ? reject(err) : resolve(res)
        )
      ),

    createSeedVault: (loginPassword, encryptionPassword) =>
      new Promise((resolve, reject) =>
        _backgroundConnection.createSeedVault(
          loginPassword,
          encryptionPassword,
          (err, res) => {
            err ? reject(err) : resolve(res)
          }
        )
      ),

    startFetchMam: options =>
      new Promise((resolve, reject) =>
        _backgroundConnection.startFetchMam(options, (res, err) =>
          err ? reject(err) : resolve(res)
        )
      ),

    getMamChannels: () =>
      new Promise((resolve, reject) =>
        _backgroundConnection.startFetchMam((res, err) =>
          err ? reject(err) : resolve(res)
        )
      ),

    registerMamChannel: channel =>
      new Promise((resolve, reject) =>
        _backgroundConnection.registerMamChannel(channel, (res, err) =>
          err ? reject(err) : resolve(res)
        )
      ),

    loadAccountData: () =>
      new Promise((resolve, reject) =>
        _backgroundConnection.loadAccountData((err, res) => {
          err ? reject(err) : resolve(res)
        })
      ),

    enableTransactionsAutoPromotion: time =>
      new Promise((resolve, reject) =>
        _backgroundConnection.enableTransactionsAutoPromotion(
          time,
          (res, err) => (err ? reject(err) : resolve(res))
        )
      ),

    disableTransactionsAutoPromotion: () =>
      new Promise((resolve, reject) =>
        _backgroundConnection.disableTransactionsAutoPromotion(
          time,
          (res, err) => (err ? reject(err) : resolve(res))
        )
      ),

    getConnection: origin =>
      new Promise((resolve, reject) =>
        _backgroundConnection.getConnection(origin, (res, err) =>
          err ? reject(err) : resolve(res)
        )
      ),

    pushConnection: connection =>
      new Promise((resolve, reject) =>
        _backgroundConnection.pushConnection(connection, (res, err) =>
          err ? reject(err) : resolve(res)
        )
      ),

    updateConnection: connection =>
      new Promise((resolve, reject) =>
        _backgroundConnection.updateConnection(connection, (res, err) =>
          err ? reject(err) : resolve(res)
        )
      ),

    completeConnection: () =>
      new Promise((resolve, reject) =>
        _backgroundConnection.completeConnection((res, err) =>
          err ? reject(err) : resolve(res)
        )
      ),

    rejectConnection: () =>
      new Promise((resolve, reject) =>
        _backgroundConnection.rejectConnection((res, err) =>
          err ? reject(err) : resolve(res)
        )
      ),

    getConnections: () =>
      new Promise((resolve, reject) =>
        _backgroundConnection.getConnections((res, err) =>
          err ? reject(err) : resolve(res)
        )
      ),

    removeConnection: connection =>
      new Promise((resolve, reject) =>
        _backgroundConnection.removeConnection(connection, (res, err) =>
          err ? reject(err) : resolve(res)
        )
      ),

    addConnection: connection =>
      new Promise((resolve, reject) =>
        _backgroundConnection.addConnection(connection, (res, err) =>
          err ? reject(err) : resolve(res)
        )
      ),

    getConnectionRequest: () =>
      new Promise((resolve, reject) =>
        _backgroundConnection.getConnectionRequest((res, err) =>
          err ? reject(err) : resolve(res)
        )
      )
  }
}

export default buildPromisedBackgroundApi
