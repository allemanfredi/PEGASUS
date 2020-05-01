import { extractJson } from '@iota/extract-json'

/**
 *
 * Returns the message within a bundle
 *
 * @param {Object} _bundle
 */
const getMessage = _bundle => {
  try {
    return JSON.parse(extractJson(_bundle))
  } catch (err) {
    return null
  }
}

/**
 *
 * Function used to transforma bundle into
 * an object easliy interpretable by the popup
 *
 * @param {Object} _bundle
 * @param {Array} _addresses
 */
const bundleToWalletTransaction = (_bundle, _addresses) => {
  let value = 0
  let values = []
  for (let transaction of _bundle) {
    if (_addresses.includes(transaction.address)) {
      value = value + transaction.value
      values.push(transaction.value)
    }
  }

  if (value < 0) {
    value = 0
    values = values.map(value => -value)
    values.forEach(v => {
      value = value + v
    })
    value = -1 * value
  }

  const message = getMessage(_bundle)

  return {
    timestamp: _bundle[0].attachmentTimestamp,
    value,
    persistence: _bundle[0].persistence,
    bundle: _bundle[0].bundle,
    message,
    hash: _bundle[0].hash
  }
}

export { getMessage, bundleToWalletTransaction }
