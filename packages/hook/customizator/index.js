import { composeAPI } from '@iota/core'
import * as bundle from '@iota/bundle'
import * as bundleValidator from '@iota/bundle-validator'
import * as checksum from '@iota/checksum'
import * as converter from '@iota/converter'
import * as extractJson from '@iota/extract-json'
import * as transaction from '@iota/transaction'
import * as validators from '@iota/validators'
import * as unitConverter from '@iota/unit-converter'
import Mam from '@iota/mam/lib/mam.web.min.js'
import Utils from '@pegasus/utils/utils'

export default {

  init (requestHandler) {
    this.request = requestHandler
  },

  getCustomIota (provider) {
    const core = composeAPI({ provider })

    core.prepareTransfers = (...args) => this._handleInjectedRequest(args, 'prepareTransfers')

    const mam = {}
    Object.keys(Mam).forEach(method => {
      mam[method] = (...args) => this._handleInjectedRequest(args, method, 'mam_')
    })

    const iota = {
      bundle,
      bundleValidator,
      checksum,
      core,
      converter,
      extractJson,
      transaction,
      unitConverter,
      validators,
      mam
    }

    const additionalMethods = [
      'connect',
      'getCurrentAccount',
      'getCurrentNode'
    ]
    additionalMethods.forEach(method => {
      iota[method] = (...args) => this._handleInjectedRequest(args, method)
    })

    //disabled for security reasons
    delete iota.core.getAccountData
    delete iota.core.getInputs
    delete iota.core.getNewAddress

    return iota
  },

  _handleInjectedRequest(args, method, prefix = '') {
    const cb = args[args.length - 1]
      ? args[args.length - 1]
      : null

    if (!Utils.isFunction(cb)) {
      return Utils.injectPromise(this.request, prefix + method, { args })
    } else {

      args = args
        ? args.slice(0, args.length - 1)
        : null

      this.request(prefix + method, { args })
        .then(res => cb(res, null))
        .catch(err => cb(null, err))
    }
  },
}