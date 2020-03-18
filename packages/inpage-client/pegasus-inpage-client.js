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
import ObjectMultiplex from 'obj-multiplex'
import pump from 'pump'

class PegasusInpageClient extends EventEmitter {
  constructor(inpageStream) {
    super()

    this.inpageStream = inpageStream

    this._mamFetches = {}
    this._calls = {}

    this.send = this.send.bind(this)

    this._bindListener()

    this._init()

    /*const mux = (this.mux = new ObjectMultiplex())
    pump(this.inpageStream, mux, this.inpageStream, e =>
      console.log('Pegasus inpage client disconnected', e)
    )*/
  }

  send(data = {}) {
    const uuid = randomUUID()

    this.inpageStream.write({
      name: 'inpageClient',
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

      console.log(response, uuid, success, action)

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
        /*case 'mam_onFetch': {
          if (this._mamFetches[uuid]) this._mamFetches[uuid](data)
          break
        }*/
        default: {
          if (success) this._calls[uuid].resolve(data)
          else this._calls[uuid].reject(data)

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

    const mam = {}
    Object.keys(Mam).forEach(method => {
      mam[method] = (...args) =>
        Utils.injectPromise(this.send, {
          method: 'mam_' + method,
          args
        })
    })

    mam.fetch = (...args) => {
      const uuid = randomUUID()

      const isFunction = Utils.isFunction(args[2])
      if (isFunction) {
        this._mamFetches[uuid] = args[2]
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

      return Utils.injectPromise(this.send, {
        method: 'mam_fetch',
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

    const additionalMethods = [
      'connect',
      'getCurrentAccount',
      'getCurrentProvider'
    ]
    additionalMethods.forEach(method => {
      this[method] = (...args) => this._handleInjectedRequest(args, method)
    })

    //disabled for security reasons
    delete core.getAccountData
    delete core.getInputs
    delete core.getNewAddress
  }

  getFavicon() {
    let favicon = document.querySelector('head > link[rel="shortcut icon"]')
    if (favicon) return favicon.href

    favicon = Array.from(
      document.querySelectorAll('head > link[rel="icon"]')
    ).find(favicon => Boolean(favicon.href))
    if (favicon) {
      return favicon.href
    }
  }
}

export default PegasusInpageClient
