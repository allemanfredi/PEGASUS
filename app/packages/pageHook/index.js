
import { composeAPI } from '@iota/core';
import ProxiedProvider from './handlers/ProxiedProvider';
import RequestHandler from './handlers/RequestHandler';
import EventChannel from '@pegasus/lib/EventChannel';



const pageHook = {

    proxiedMethods: {
        setAddress: false,
    },

    init() {
        this._bindIotaJs();
        this._bindEventChannel();
        this._bindEvents();
        
        this.request('init').then(({ address }) => {
            if(address)
                this.setAddress(address);

            console.log('Pegasus initiated');
        }).catch(err => {
            console.log('Failed to initialise iotaJs', err);
        });
    },

    _bindIotaJs() {
        if(window.iotajs !== undefined)
            console.log('iotaJs is already initiated. Pegasus will overwrite the current instance');

        /*const iotajs = new TronWeb(
            new ProxiedProvider(),
            new ProxiedProvider(),
            new ProxiedProvider()
        );*/
        const iotajs = composeAPI({provider :'http://127.0.0.1'});
        console.log(iotajs)
        window.iotajs = iotajs;
    },

    _bindEventChannel() {
        this.eventChannel = new EventChannel('pageHook');
        this.request = RequestHandler.init(this.eventChannel);
    },

    _bindEvents() {
        this.eventChannel.on('getNodeInfo', address => (
            this.setAddress(address)
        ));
    },

    setAddress(address) {
        this.proxiedMethods.setAddress(address);
        tronWeb.ready = true;
    },

};

pageHook.init();
