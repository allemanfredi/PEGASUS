
import {composeAPI} from '@iota/core';

export default {

    init(requestHandler){
        this.request = requestHandler;
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
        }

        args = [args[0]];
        this.request('prepareTransfer', {args})
        .then(transaction => (
            callback(transaction,null)
        )).catch(err => {
            callback(null,err);
        });
    }

}