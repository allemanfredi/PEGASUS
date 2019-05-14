
import {composeAPI} from '@iota/core';

export default {

    init(requestHandler){
        this.request = requestHandler;
    },

    getCustomIota(provider){
        const iotajs = composeAPI({provider});

        iotajs.attachToTangle = (...args) => this.attachToTangle(args);
        iotajs.addNeighbors = (...args) => this.addNeighbors(args);
        iotajs.broadcastBundle = (...args) => this.broadcastBundle(args);
        iotajs.broadcastTransactions = (...args) => this.broadcastTransactions(args);
        iotajs.checkConsistency = (...args) => this.checkConsistency(args);
        iotajs.findTransactionObjects = (...args) => this.findTransactionObjects(args);
        iotajs.findTransactions = (...args) => this.findTransactions(args);
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

    attachToTangle(args){
        const callback = args[4];
        if ( callback === undefined )
            throw new Error("not callback provided");
        
        this.request('attachToTangle', {args})
        .then(info => callback(info,null))
        .catch( err => callback(null,err));
    },

    broadcastBundle(args){
        const callback = args[1];
        if ( callback === undefined )
            throw new Error("not callback provided");
        
        this.request('broadcastBundle', {args})
        .then(transactions => callback(transactions,null))
        .catch( err => callback(null,err));
    },

    broadcastTransactions(args){
        const callback = args[1];
        if ( callback === undefined )
            throw new Error("not callback provided");
        
        this.request('broadcastBundle', {args})
        .then(trytes => callback(trytes,null))
        .catch( err => callback(null,err));
    },

    checkConsistency(args){
        let callback;
        args[2] ? callback = args[2] : callback = args[1];
        if ( callback === undefined )
            throw new Error("not callback provided");
        
        this.request('checkConsistency', {args})
        .then(trytes => callback(trytes,null))
        .catch( err => callback(null,err));
    },

    findTransactionObjects(args){
        const callback = args[1];
        if ( callback === undefined )
            throw new Error("not callback provided");

        this.request('findTransactionObjects', {args})
        .then(transactions => callback(transactions,null))
        .catch( err => callback(null,err));
    },

    findTransactions(args){
        const callback = args[1];
        if ( callback === undefined )
            throw new Error("not callback provided");

        this.request('findTransactions', {args})
        .then(transactions => callback(transactions,null))
        .catch( err => callback(null,err));
    },

    getNodeInfo(args){
        const callback = args[0];
        if ( callback === undefined )
            throw new Error("not callback provided");

        this.request('getNodeInfo')
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