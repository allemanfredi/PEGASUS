/**
 *
 * function used to remove seeds from all accounts
 * before passing the global state object to the popup
 *
 * @param {Object} _state
 */
const returnOnlyPublicConfigs = _state => {
  const mappedState = JSON.parse(JSON.stringify(_state))

  if (mappedState.accounts && mappedState.accounts.selected) {
    mappedState.accounts.all.forEach(account => delete account.seed)
    delete mappedState.accounts.selected.seed
  }

  delete mappedState.hpsw
  delete mappedState.data

  return mappedState
}

/**
 *
 * function used to remove seeds from current/all account/s
 * before returning getCurrentAccount and getAllAccount api result
 *
 * @param {Object} _state
 */
const removeSeed = _obj => {
  if (!_obj) return

  const mappedObj = JSON.parse(JSON.stringify(_obj))
  if (Array.isArray(_obj))
    return mappedObj.map(mo => {
      delete mo.seed
      return mo
    })

  delete mappedObj.seed
  return mappedObj
}

export { returnOnlyPublicConfigs, removeSeed }
