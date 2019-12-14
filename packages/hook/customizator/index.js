import { composeAPI } from '@iota/core'
import Utils from '@pegasus/utils/utils'

export default {

  init (requestHandler) {
    this.request = requestHandler
  },

  getCustomIota (provider) {
    const iotajsHandler = composeAPI({ provider })
    const iotajsTarget = composeAPI({ provider })

    Object.entries(iotajsTarget).forEach(([method]) => {
      iotajsTarget[method] = (...args) => {

        const cb = args[args.length - 1]
          ? args[args.length - 1]
          : null

        if (!Utils.isFunction(cb)) {
          return Utils.injectPromise(this.request, method, { args })
        } else {

          args = args
            ? args.slice(0, args.length - 1)
            : null

          this.request(method, { args })
            .then(res => cb(res, null))
            .catch(err => cb(null, err))
        }
      }
    })

    const additionalMethods = [
      'connect',
      'getCurrentAccount',
      'getCurrentNode'
    ]
    additionalMethods.forEach(method => {
      iotajsTarget[method] = (...args) => {

        const cb = args[args.length - 1]
          ? args[args.length - 1]
          : null

        if (!Utils.isFunction(cb)) {
          return Utils.injectPromise(this.request, method, { args })
        } else {

          args = args
            ? args.slice(0, args.length - 1)
            : null

          this.request(method, { args })
            .then(res => cb(res, null))
            .catch(err => cb(null, err))
        }
      }
    })

    //disabled for security reasons
    delete iotajsTarget.getAccountData
    delete iotajsTarget.getInputs
    delete iotajsTarget.getNewAddress

    return new Proxy(iotajsTarget, iotajsHandler)
  }
}