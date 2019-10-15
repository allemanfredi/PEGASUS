
//import ProxiedProvider from './handlers/ProxiedProvider';
import RequestHandler from './handlers/RequestHandler';
import EventChannel from '@pegasus/lib/EventChannel';
import Customizator from './customizators/Customizator'

const pageHook = {

  init() {

    this._bindEventChannel();

    Customizator.init(this.request);

    this._bindEvents();
    this._bindIotaJs();

    this.request('init').then(({ selectedAddress, selectedProvider }) => {

      if (selectedAddress) {
        this.setAddress(selectedAddress);
      }
      if (selectedProvider) {
        this.setProvider(selectedProvider);
      }

      console.log('Pegasus initiated succesfully');
    }).catch(err => {
      console.log('Failed to initialise Pegasus', err);
    });
  },

  _bindIotaJs() {
    if (window.iotajs !== undefined)
      console.log('iotaJs is already initiated. Pegasus will overwrite the current instance');


    const iotajs = Customizator.getCustomIota(this.selectedProvider);

    const iota = {
      iotajs: iotajs,
      selectedAddress: this.selectedAddress,
      selectedProvider: this.selectedProvider
    }

    window.iota = iota;
  },

  _bindEventChannel() {
    this.eventChannel = new EventChannel('pageHook');
    this.request = RequestHandler.init(this.eventChannel);
  },

  _bindEvents() {
    this.eventChannel.on('setAddress', address => (
      this.setAddress(address)
    ));

    this.eventChannel.on('setProvider', provider => (
      this.setProvider(provider)
    ));
  },

  setProvider(provider) {
    window.iota.selectedProvider = provider;
    window.iota.iotajs = Customizator.getCustomIota(provider);
  },

  setAddress(address) {
    window.iota.selectedAddress = address;
  },

};

pageHook.init();
