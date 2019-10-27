
// import ProxiedProvider from './handlers/ProxiedProvider';
import requester from './requester'
import connector from './connector'
import EventChannel from '@pegasus/lib/EventChannel'
import customizator from './customizator'

const hook = {

  init () {
    this._bindEventChannel()

    customizator.init(this.request)
    
    this._bindEvents()
    this._bindIotaJs()
    
    connector.init(this.request)

    this.request('init').then(({ selectedAddress, selectedProvider }) => {
      this.setAddress(selectedAddress)
      this.setProvider(selectedProvider)
      console.log('Pegasus initiated succesfully')
    }).catch(err => {
      console.log('Failed to initialise Pegasus', err)
    })
  },

  _bindIotaJs () {
    if (window.iotajs !== undefined)
      console.log('iotaJs is already initiated. Pegasus will overwrite the current instance')

    const iotajs = customizator.getCustomIota(this.selectedProvider)
    const iota = {
      iotajs: iotajs,
      selectedAddress: this.selectedAddress,
      selectedProvider: this.selectedProvider
    }
    window.iota = iota
  },

  _bindEventChannel () {
    this.eventChannel = new EventChannel('pageHook')
    this.request = requester.init(this.eventChannel)
  },

  _bindEvents () {
    this.eventChannel.on('setAddress', address =>
      this.setAddress(address)
    )

    this.eventChannel.on('setProvider', provider =>
      this.setProvider(provider)
    )
  },

  setProvider (provider) {
    window.iota.selectedProvider = provider
    window.iota.iotajs = customizator.getCustomIota(provider)
  },

  setAddress (address) {
    window.iota.selectedAddress = address
  }

}

hook.init()
