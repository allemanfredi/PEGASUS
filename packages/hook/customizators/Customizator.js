
import {composeAPI} from '@iota/core';

export default {

    init(requestHandler){
        this.request = requestHandler;
    },

    getCustomIota(provider){
        const iotajs = composeAPI({provider});
        
        [ 'composeAPI' ].forEach(method => (
            iotajs[ method ] = () => new Error('Pegasus does not allow to use this method')
        ));

        iotajs.addNeighbors = (...args) => this.addNeighbors(args)
        iotajs.prepareTransfers = (...args) => this.prepareTransfers(args);
        iotajs.getNodeInfo = (...args) => this.getNodeInfo(args);
        
        return iotajs;
    },

    addNeighbors(args){
        const callback = args[1];
        if ( callback === undefined )
            throw new Error("not callback provided");
        
        this.request('addNeighbors',{args})
        .then(numAdded  => callback(numAdded,null))
        .catch(err => callback(null,err));
    },

    getNodeInfo(args){
        const callback = args[0];
        if ( callback === undefined )
            throw new Error("not callback provided");

        this.request('getNodeInfo', {args})
        .then(info => callback(info,null))
        .catch( err => callback(null,err));
    },

    prepareTransfers(args){

        const callback = args[1];
        if ( callback === undefined )
            throw new Error("not callback provided");
        
        args = [args[0]];
        this.request('prepareTransfer', {args})
        .then(transaction => (
            callback(transaction,null)
        )).catch(err => {
            callback(null,err);
        });
    }



}