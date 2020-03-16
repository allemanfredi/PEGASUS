const buildPromisedApi = _backgroundConnection => {
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
        _backgroundConnection.updateAvatarAccount(account, avatar, (res, err) =>
          err ? reject(err) : resolve(res)
        )
      )
  }
}

export default buildPromisedApi
