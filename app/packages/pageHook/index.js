
import { composeAPI } from '@iota/core';
//import ProxiedProvider from './handlers/ProxiedProvider';
import RequestHandler from './handlers/RequestHandler';
import EventChannel from '@pegasus/lib/EventChannel';


const pageHook = {

    proxiedMethods: {
        setAddress: false,
    },

    selectedAddress : '',

    init() {
        this._bindIotaJs();
        this._bindEventChannel();
        this._bindEvents();
        
        this.request('init').then(({ address, provider }) => {
            if(address)
                this.setAddress(address);
            
            if(provider)
                this.setProvider(provider);

            console.log(address);
            console.log('Pegasus initiated');
        }).catch(err => {
            console.log('Failed to initialise iotaJs', err);
        });
    },

    _bindIotaJs() {
        if(window.iotajs !== undefined)
            console.log('iotaJs is already initiated. Pegasus will overwrite the current instance');

        const iotajs = composeAPI();
        iotajs.getNodeInfo = () => (
            this.getNodeInfo()
        );

        const iota = {
            iotajs : iotajs,
            selectedAddress : this.selectedAddress
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

    setProvider(provider){
        window.iota.iotajs = composeAPI({provider});
    },

    setAddress(address) {
        window.iota.selectedAddress = address;
    },

    getNodeInfo(){
        console.log("injection completed");
    }

};

pageHook.init();
