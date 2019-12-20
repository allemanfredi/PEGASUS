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
import randomUUID from 'uuid/v4'

export default {

  init (requestHandler, eventChannel) {
    this.request = requestHandler
    this.eventChannel = eventChannel
    this._handleEvents()

    this.callbacks = {}
  },

  getCustomIota (provider) {
    const core = composeAPI({ provider })

    core.prepareTransfers = (...args) => this._handleInjectedRequest(args, 'prepareTransfers')

    const mam = {}
    Object.keys(Mam).forEach(method => {
      mam[method] = (...args) => Utils.injectPromise(this.request, 'mam_' + method, { args })
    })

    mam.fetch = (...args) => {
      const uuid = randomUUID()
      
      const isFunction = Utils.isFunction(args[2])
      if (isFunction) {
        this.callbacks[uuid] = args[2]
        args[2] = {
          uuid,
          reply: true
        }
      } else {
        const limit = args[2]
        args[2] = {
          uuid,
          reply: false
        }
        args.push(limit)
      }
      
      return Utils.injectPromise(this.request, 'mam_fetch', { args })
    }

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
      'getCurrentProvider'
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

  //TODO find a new way to handle mam fetch responses from background because
  //in this way the message is sent to all tab and not only to which has made the request
  _handleEvents () {
    this.eventChannel.on('mam_onFetch', e => {
      const {
        data,
        uuid
      } = e

      if (this.callbacks[uuid])
        this.callbacks[uuid](data)        
    })
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