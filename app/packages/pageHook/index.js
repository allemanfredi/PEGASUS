
//import ProxiedProvider from './handlers/ProxiedProvider';
import RequestHandler from './handlers/RequestHandler';
import EventChannel from '@pegasus/lib/EventChannel';
import {composeAPI} from '@iota/core';

const pageHook = {


    init() {
        this._bindIotaJs();
        this._bindEventChannel();
        this._bindEvents();
        
        this.request('init').then(({ selectedAddress, selectedProvider }) => {
            if(selectedAddress){
                this.setAddress(selectedAddress);
                this.selectedAddress = selectedAddress;
            }
            
            if(selectedProvider){
                this.setProvider(selectedProvider);
            }

            console.log(selectedProvider);
            console.log('Pegasus initiated');
        }).catch(err => {
            console.log('Failed to initialise iotaJs', err);
        });
    },

    _bindIotaJs() {
        if(window.iotajs !== undefined)
            console.log('iotaJs is already initiated. Pegasus will overwrite the current instance');

        
        const iotajs = this.getCustomIota(this.selectedProvider);

        const iota = {
            iotajs : iotajs,
            selectedAddress : this.selectedAddress,
            selectedProvider : this.selectedProvider
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
        window.iota.selectedProvider = provider;
        window.iota.iotajs = this.getCustomIota(provider);
    },

    setAddress(address) {
        window.iota.selectedAddress = address;
    },
    
    getCustomIota(provider){
        const iotajs = composeAPI({provider});
    
        iotajs.prepareTransfers = (...args) => (
            this.prepareTransfers(args)
        );
        return iotajs;
    },

    prepareTransfers(args){

        const callback = args[1];
        if ( callback === undefined ){
            throw new Error("not callback provided");
            return;
        }

        args = [args[0]];
        this.request('prepareTransfer', {args})
        .then(transaction => (
            callback(null, transaction)
        )).catch(err => {
            console.log(err);
            callback(err);
        });
    }

    
};

pageHook.init();
