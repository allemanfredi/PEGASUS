
import {composeAPI} from '@iota/core';
import Utils from '@pegasus/lib/utils'; 

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
        iotajs.getAccountData = (...args) => this.getAccountData(args);
        iotajs.getBalances = (...args) => this.getBalances(args);
        iotajs.getBundle = (...args) => this.getBundle(args);
        iotajs.getInclusionStates = (...args) => this.getInclusionStates(args);
        iotajs.getInputs = (...args) => this.getInputs(args);
        iotajs.getLatestInclusion = (...args) => this.getLatestInclusion(args);
        iotajs.getNeighbors = (...args) => this.getNeighbors(args);
        iotajs.getNewAddress = (...args) => this.getNewAddress(args);
        iotajs.getNodeInfo = (...args) => this.getNodeInfo(args);
        iotajs.getTips = (...args) => this.getTips(args);
        iotajs.getTransactionObjects = (...args) => this.getTransactionObjects(args);
        iotajs.getTransactionsToApprove = (...args) => this.getTransactionsToApprove(args);
        iotajs.getTrytes = (...args) => this.getTrytes(args);
        iotajs.isPromotable = (...args) => this.isPromotable(args);
        iotajs.prepareTransfers = (...args) => this.prepareTransfers(args);
        iotajs.promoteTransaction = (...args) => this.promoteTransaction(args);
        iotajs.removeNeighbors = (...args) => this.removeNeighbors(args);
        iotajs.replayBundle = (...args) => this.replayBundle(args);
        iotajs.sendTrytes = (...args) => this.sendTrytes(args);
        iotajs.storeAndBroadcast = (...args) => this.storeAndBroadcast(args);
        iotajs.storeTransactions = (...args) => this.storeTransactions(args);
        iotajs.traverseBundle = (...args) => this.traverseBundle(args);
        iotajs.generateAddress = (...args) => this.generateAddress(args);
        
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

    getAccountData(args){
        let callback;
        args[1] ? callback = args[1] : callback = args[0];

        if ( callback === undefined )
            throw new Error("not callback provided");
    
        this.request('getAccountData', {args})
        .then(data => callback(data,null))
        .catch( err => callback(null,err));
    },

    getBalances(args){
        const callback = args[2];
        if ( callback === undefined )
            throw new Error("not callback provided");

        this.request('getBalances',{args})
        .then(balances  => callback(balances,null))
        .catch(err => callback(null,err));
    },

    getBundle(args){
        const callback = args[1];
        if ( callback === undefined )
            throw new Error("not callback provided");

        this.request('getBundle',{args})
        .then(bundle  => callback(bundle,null))
        .catch(err => callback(null,err));
    },

    getInclusionStates(args){
        const callback = args[2];
        if ( callback === undefined )
            throw new Error("not callback provided");

        this.request('getInclusionStates',{args})
        .then(states  => callback(states,null))
        .catch(err => callback(null,err));
    },

    getInputs(args){
        let callback;
        args[1] ? callback = args[1] : callback = args[0];
        if ( callback === undefined )
            throw new Error("not callback provided");
    
        this.request('getInputs', {args})
        .then(data => callback(data,null))
        .catch( err => callback(null,err));
    },

    getLatestInclusion(args){
        let callback;
        args[2] ? callback = args[2] : callback = args[1];
        if ( callback === undefined )
            throw new Error("not callback provided");
    
        this.request('getLatestInclusion', {args})
        .then(states => callback(states,null))
        .catch( err => callback(null,err));
    },

    getNeighbors(args){
        const callback = args[0];
        if ( callback === undefined )
            throw new Error("not callback provided");

        this.request('getNeighbors')
        .then(info => callback(info,null))
        .catch( err => callback(null,err));
    },

    getNewAddress(args){
        let callback;
        args[1] ? callback = args[1] : callback = args[0];
        if ( callback === undefined )
            throw new Error("not callback provided");
    
        this.request('getNewAddress', {args})
        .then(address => callback(address,null))
        .catch( err => callback(null,err));
    },

    getNodeInfo(args){
        const callback = args[0];
        if ( callback === undefined )
            //return Utils.injectPromise(this.getNodeInfo.bind(this), args);
            throw new Error("not callback provided");

        this.request('getNodeInfo')
        .then(info => callback(info,null))
        .catch( err => callback(null,err));
    },

    getTips(args){
        const callback = args[0];
        if ( callback === undefined )
            throw new Error("not callback provided");

        this.request('getTips')
        .then(tips => callback(tips,null))
        .catch( err => callback(null,err));
    },

    getTransactionObjects(args){
        const callback = args[1];
        if ( callback === undefined )
            throw new Error("not callback provided");

        this.request('getTransactionObjects',{args})
        .then(transaction  => callback(transaction,null))
        .catch(err => callback(null,err));
    },

    getTransactionsToApprove(args){
        let callback;
        args[2] ? callback = args[2] : callback = args[1];
        if ( callback === undefined )
            throw new Error("not callback provided");
    
        this.request('getTransactionsToApprove', {args})
        .then(transactions => callback(transactions,null))
        .catch( err => callback(null,err));
    },

    getTrytes(args){
        const callback = args[1];
        if ( callback === undefined )
            throw new Error("not callback provided");

        this.request('getTrytes',{args})
        .then(trytes  => callback(trytes,null))
        .catch(err => callback(null,err));
    },

    isPromotable(args){
        const callback = args[1];
        if ( callback === undefined )
            throw new Error("not callback provided");

        this.request('isPromotable',{args})
        .then(isPromotable  => callback(isPromotable,null))
        .catch(err => callback(null,err));
    },

    prepareTransfers(args){
        let callback;
        args[2] ? callback = args[2] : callback = args[1];
        if ( callback === undefined )
            throw new Error("not callback provided");
        
        args = [args[0]];
        this.request('prepareTransfer', {args})
        .then(transaction => {
            callback(transaction,null)
        }).catch(err => {
            callback(null,err);
        });
    },

    promoteTransaction(args){
        let callback;
        args[5] ? callback = args[5] : callback = args[4];
        if ( callback === undefined )
            throw new Error("not callback provided");
        
        args = [args[0]];
        this.request('promoteTransaction', {args})
        .then(tail => {
            callback(tail,null)
        }).catch(err => {
            callback(null,err);
        });
    },

    removeNeighbors(args){
        const callback = args[1];
        if ( callback === undefined )
            throw new Error("not callback provided");

        this.request('removeNeighbors',{args})
        .then(state  => callback(state,null))
        .catch(err => callback(null,err));
    },

    replayBundle(args){
        const callback = args[3];
        if ( callback === undefined )
            throw new Error("not callback provided");

        this.request('replayBundle',{args})
        .then(reattachedTail  => callback(reattachedTail,null))
        .catch(err => callback(null,err));
    },

    sendTrytes(args){
        let callback;
        args[4] ? callback = args[4] : callback = args[3];
        if ( callback === undefined )
            throw new Error("not callback provided");
        
        args = [args[0]];
        this.request('sendTrytes', {args})
        .then(trytes => {
            callback(trytes,null)
        }).catch(err => {
            callback(null,err);
        });
    },

    storeAndBroadcast(args){
        const callback = args[1];
        if ( callback === undefined )
            throw new Error("not callback provided");

        this.request('storeAndBroadcast',{args})
        .then(trytes  => callback(trytes,null))
        .catch(err => callback(null,err));
    },

    storeTransactions(args){
        const callback = args[1];
        if ( callback === undefined )
            throw new Error("not callback provided");

        this.request('storeTransactions',{args})
        .then(trytes  => callback(trytes,null))
        .catch(err => callback(null,err));
    },

    traverseBundle(args){
        let callback;
        args[2] ? callback = args[2] : callback = args[1];
        if ( callback === undefined )
            throw new Error("not callback provided");
        
        this.request('traverseBundle', {args})
        .then(bundle => {
            callback(bundle,null)
        }).catch(err => {
            callback(null,err);
        });
    },

    generateAddress(args){
        let callback;
        args[3] ? callback = args[3] : (args[2] ? callback = args[2] : callback = args[1]);
        if ( callback === undefined )
            throw new Error("not callback provided");
        
        this.request('generateAddress', {args})
        .then(address => {
            callback(address,null)
        }).catch(err => {
            callback(null,err);
        });
    }


}