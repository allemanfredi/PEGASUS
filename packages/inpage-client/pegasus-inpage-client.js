import { composeAPI } from '@iota/core'
import * as bundle from '@iota/bundle'
import * as bundleValidator from '@iota/bundle-validator'
import * as checksum from '@iota/checksum'
import * as converter from '@iota/converter'
import * as extractJson from '@iota/extract-json'
import * as transaction from '@iota/transaction'
import * as validators from '@iota/validators'
import * as unitConverter from '@iota/unit-converter'
import Utils from '@pegasus/utils/utils'
import randomUUID from 'uuid/v4'
import EventEmitter from 'eventemitter3'

class PegasusInpageClient extends EventEmitter {
  constructor(inpageStream) {
    super()

    this.inpageStream = inpageStream

    this._calls = {}

    this.send = this.send.bind(this)

    this._bindListener()

    this._init()
  }

  send(data = {}) {
    const uuid = randomUUID()

    this.inpageStream.write({
      name: 'client',
      data: Object.assign({}, data, {
        uuid
      })
    })

    return new Promise((resolve, reject) => {
      this._calls[uuid] = {
        resolve,
        reject
      }
    })
  }

  _handleInjectedRequest(args, method, prefix = '') {
    const cb = args[args.length - 1] ? args[args.length - 1] : null

    if (!Utils.isFunction(cb)) {
      return Utils.injectPromise(this.send, {
        method: prefix + method,
        args
      })
    } else {
      args = args ? args.slice(0, args.length - 1) : null

      this.send({
        method: prefix + method,
        args
      })
        .then(res => cb(res, null))
        .catch(err => cb(null, err))
    }
  }

  _bindListener() {
    this.inpageStream.on('data', ({ data }) => {
      const { response, uuid, action, success } = data

      switch (action) {
        case 'providerChanged': {
          this.selectedProvider = response
          this.emit('providerChanged', response)
          break
        }
        case 'accountChanged': {
          this.selectedAccount = response
          this.emit('accountChanged', response)
          break
        }
        default: {
          if (success) this._calls[uuid].resolve(response)
          else this._calls[uuid].reject(response)

          delete this._calls[uuid]
          break
        }
      }
    })
  }

  _init() {
    const core = composeAPI()
    Object.keys(core).forEach(method => {
      core[method] = (...args) => this._handleInjectedRequest(args, method)
    })

    this.bundle = bundle
    this.bundleValidator = bundleValidator
    this.checksum = checksum
    this.core = core
    this.converter = converter
    this.extractJson = extractJson
    this.transaction = transaction
    this.unitConverter = unitConverter
    this.validators = validators

    const additionalMethods = [
      'connect',
      'transfer',
      'getCurrentAccount',
      'getCurrentProvider'
    ]
    additionalMethods.forEach(method => {
      this[method] = (...args) => this._handleInjectedRequest(args, method)
    })

    // disabled for security reasons
    delete core.getAccountData
    delete core.getInputs
    delete core.getNewAddress
  }

  getFavicon() {
    let favicon = document.querySelector('head > link[rel="shortcut icon"]')
    if (favicon) return favicon.href

    favicon = Array.from(
      document.querySelectorAll('head > link[rel="icon"]')
    ).find(fi => Boolean(fi.href))
    if (favicon) return favicon.href
  }
}

export default PegasusInpageClient
