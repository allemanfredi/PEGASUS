/**
 * 
 * function used to remove seeds from all accounts 
 * before passing the global state object to the popup
 * 
 * @param {Object} _state 
 */
const mapStateForPopup = _state => {
  const mappedState = JSON.parse(JSON.stringify(_state))

  if (mappedState.accounts && mappedState.accounts.selected) {
    mappedState.accounts.all.forEach(account => delete account.seed)
    delete mappedState.accounts.selected.seed
  }

  return mappedState
}

export { mapStateForPopup }
