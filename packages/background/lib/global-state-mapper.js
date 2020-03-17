import Utils from '@pegasus/utils/utils'

const mapStateForPopup = _state => {
  const mappedState = Utils.copyObject(_state)

  if (!mappedState.accounts) return _state

  mappedState.accounts.forEach(account => delete account.seed)
  return mappedState
}

export { mapStateForPopup }
