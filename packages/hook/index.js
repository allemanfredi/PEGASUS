
// import ProxiedProvider from './handlers/ProxiedProvider';
import requester from './requester'
import connector from './connector'
import EventChannel from '@pegasus/lib/EventChannel'
import customizator from './customizator'

const hook = {

  init () {
    this._bindEventChannel()
    this._bindEvents()

    this.request('init').then(({ selectedProvider }) => {

      customizator.init(this.request)    
      this.injectIotaJs(selectedProvider)

      connector.init(this.request)

      console.log('Pegasus initiated succesfully')
    }).catch(err => {
      console.log('Failed to initialise Pegasus', err)
    })
  },

  _bindEventChannel () {
    this.eventChannel = new EventChannel('pageHook')
    this.request = requester.init(this.eventChannel)
  },

  _bindEvents () {
    this.eventChannel.on('setProvider', provider =>
      this.injectIotaJs(provider)
    )
  },

  injectIotaJs (provider) {
    window.iota = customizator.getCustomIota(provider)
  }
}

hook.init()
