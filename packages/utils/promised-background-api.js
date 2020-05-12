const buildPromisedBackgroundApi = _backgroundConnection => {
  return {
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

    isUnlocked: () =>
      new Promise((resolve, reject) =>
        _backgroundConnection.isUnlocked((res, err) =>
          err ? reject(err) : resolve(res)
        )
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

    updateNameAccount: name =>
      new Promise((resolve, reject) =>
        _backgroundConnection.updateNameAccount(name, (res, err) =>
          err ? reject(err) : resolve(res)
        )
      ),

    updateAvatarAccount: avatar =>
      new Promise((resolve, reject) =>
        _backgroundConnection.updateAvatarAccount(avatar, (res, err) =>
          err ? reject(err) : resolve(res)
        )
      ),

    deleteAccount: account =>
      new Promise((resolve, reject) =>
        _backgroundConnection.deleteAccount(account, (res, err) =>
          err ? reject(err) : resolve(res)
        )
      ),

    setSettings: settings =>
      new Promise((resolve, reject) =>
        _backgroundConnection.setSettings(settings, (res, err) =>
          err ? reject(err) : resolve(res)
        )
      ),

    getSettings: () =>
      new Promise((resolve, reject) =>
        _backgroundConnection.getSettings((res, err) =>
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

    importSeedVault: (encodedFile, password) =>
      new Promise((resolve, reject) =>
        _backgroundConnection.importSeedVault(
          encodedFile,
          password,
          (err, res) => {
            err ? reject(err) : resolve(res)
          }
        )
      ),

    fetchFromPopup: options =>
      new Promise((resolve, reject) =>
        _backgroundConnection.fetchFromPopup(options, (res, err) =>
          err ? reject(err) : resolve(res)
        )
      ),

    getMamChannels: () =>
      new Promise((resolve, reject) =>
        _backgroundConnection.getMamChannels((res, err) =>
          err ? reject(err) : resolve(res)
        )
      ),

    registerMamChannel: channel =>
      new Promise((resolve, reject) =>
        _backgroundConnection.registerMamChannel(channel, (res, err) =>
          err ? reject(err) : resolve(res)
        )
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
        _backgroundConnection.disableTransactionsAutoPromotion((res, err) =>
          err ? reject(err) : resolve(res)
        )
      ),

    enableTransactionsAutoReattachment: time =>
      new Promise((resolve, reject) =>
        _backgroundConnection.enableTransactionsAutoReattachment(
          time,
          (res, err) => (err ? reject(err) : resolve(res))
        )
      ),

    disableTransactionsAutoReattachment: () =>
      new Promise((resolve, reject) =>
        _backgroundConnection.disableTransactionsAutoReattachment((res, err) =>
          err ? reject(err) : resolve(res)
        )
      ),

    completeConnectionRequest: (origin, tabId) =>
      new Promise((resolve, reject) =>
        _backgroundConnection.completeConnectionRequest(
          origin,
          tabId,
          (res, err) => (err ? reject(err) : resolve(res))
        )
      ),

    rejectConnectionRequest: (origin, tabId) =>
      new Promise((resolve, reject) =>
        _backgroundConnection.rejectConnectionRequest(
          origin,
          tabId,
          (res, err) => (err ? reject(err) : resolve(res))
        )
      ),

    getConnections: () =>
      new Promise((resolve, reject) =>
        _backgroundConnection.getConnections((res, err) =>
          err ? reject(err) : resolve(res)
        )
      ),

    removeConnection: origin =>
      new Promise((resolve, reject) =>
        _backgroundConnection.removeConnection(origin, (res, err) =>
          err ? reject(err) : resolve(res)
        )
      ),

    addConnection: connection =>
      new Promise((resolve, reject) =>
        _backgroundConnection.addConnection(connection, (res, err) =>
          err ? reject(err) : resolve(res)
        )
      ),

    getConnectionRequests: () =>
      new Promise((resolve, reject) =>
        _backgroundConnection.getConnectionRequests((res, err) =>
          err ? reject(err) : resolve(res)
        )
      ),

    // TODO: remove when UI will be refactored
    getRecentsAddresses: () =>
      new Promise((resolve, reject) =>
        _backgroundConnection.getRecentsAddresses((res, err) =>
          err ? reject(err) : resolve(res)
        )
      )
  }
}

export default buildPromisedBackgroundApi
