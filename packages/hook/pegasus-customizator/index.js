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
import EventEmitter from 'eventemitter3'

class PegasusCustomizator extends EventEmitter {
  constructor(configs) {
    super()

    const { pegasusConnector, eventChannel } = configs

    this.pegasusConnector = pegasusConnector
    this.eventChannel = eventChannel

    this._callbacks = {}

    this.eventChannel.on('setSelectedProvider', provider => {
      this.selectedProvider = provider
      this.emit('onProviderChanged', provider)
    })

    this.eventChannel.on('setSelectedAccount', account => {
      this.selectedAccount = account
      this.emit('onAccountChanged', account)
    })

    this.pegasusConnector
      .send('init')
      .then(({ selectedAccount, selectedProvider }) => {
        this._set(selectedProvider, selectedAccount)
      })
  }

  _set(provider, account) {
    const core = composeAPI()
    Object.keys(core).forEach(method => {
      core[method] = (...args) => this._handleInjectedRequest(args, method)
    })

    const mam = {}
    Object.keys(Mam).forEach(method => {
      mam[method] = (...args) =>
        Utils.injectPromise(this.pegasusConnector.send, 'mam_' + method, {
          args
        })
    })

    mam.fetch = (...args) => {
      const uuid = randomUUID()

      const isFunction = Utils.isFunction(args[2])
      if (isFunction) {
        this._callbacks[uuid] = args[2]
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

      return Utils.injectPromise(this.pegasusConnector.send, 'mam_fetch', {
        args
      })
    }

    this.bundle = bundle
    this.bundleValidator = bundleValidator
    this.checksum = checksum
    this.core = core
    this.converter = converter
    this.extractJson = extractJson
    this.transaction = transaction
    this.unitConverter = unitConverter
    this.validators = validators
    this.mam = mam

    this.selectedProvider = provider
    this.selectedAccount = account

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

    window.iota = this
  }

  //TODO find a new way to handle mam fetch responses from background because
  //in this way the message is sent to all tab and not only to which has made the request
  _handleEvents() {
    this.eventChannel.on('mam_onFetch', e => {
      const { data, uuid } = e

      if (this._callbacks[uuid]) this._callbacks[uuid](data)
    })
  }

  _handleInjectedRequest(args, method, prefix = '') {
    const cb = args[args.length - 1] ? args[args.length - 1] : null

    if (!Utils.isFunction(cb)) {
      return Utils.injectPromise(this.pegasusConnector.send, prefix + method, {
        args
      })
    } else {
      args = args ? args.slice(0, args.length - 1) : null

      this.pegasusConnector
        .send(prefix + method, { args })
        .then(res => cb(res, null))
        .catch(err => cb(null, err))
    }
  }
}

export default PegasusCustomizator
