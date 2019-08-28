
import {composeAPI} from '@iota/core';
import Utils from '@pegasus/lib/utils'; 

export default {

    init(requestHandler){
        this.request = requestHandler;
    },

    getCustomIota(provider){
        const iotajs = composeAPI({provider});

        Object.entries(iotajs).forEach( ([method]) => {
            iotajs[method] = (...args) => this[method](args)
        });
        
        return iotajs;
    },

    addNeighbors(args){
        const callback = args[1];
        if ( callback === undefined )
            return Utils.injectPromise(this.request, 'addNeighbors');
        
        this.request('addNeighbors',{args})
        .then(numAdded  => callback(numAdded,null))
        .catch(err => callback(null,err));
    },

    attachToTangle(args){
        const callback = args[4];
        if ( callback === undefined )
            return Utils.injectPromise(this.request, 'attachToTangle', {args});

        this.request('attachToTangle', {args})
        .then(info => callback(info,null))
        .catch( err => callback(null,err));
    },

    broadcastBundle(args){
        const callback = args[1];
        if ( callback === undefined )
            return Utils.injectPromise(this.request, 'broadcastBundle', {args});
        
        this.request('broadcastBundle', {args})
        .then(transactions => callback(transactions,null))
        .catch( err => callback(null,err));
    },

    broadcastTransactions(args){
        const callback = args[1];
        if ( callback === undefined )
            return Utils.injectPromise(this.request, 'broadcastTransactions', {args});
        
        this.request('broadcastTransactions', {args})
        .then(trytes => callback(trytes,null))
        .catch( err => callback(null,err));
    },

    checkConsistency(args){
        let callback;
        args[2] ? callback = args[2] : callback = args[1];
        if ( callback === undefined )
            return Utils.injectPromise(this.request, 'checkConsistency', {args});
        
        this.request('checkConsistency', {args})
        .then(trytes => callback(trytes,null))
        .catch( err => callback(null,err));
    },

    findTransactionObjects(args){
        const callback = args[1];
        if ( callback === undefined )
            return Utils.injectPromise(this.request, 'findTransactionObjects', {args});

        this.request('findTransactionObjects', {args})
        .then(transactions => callback(transactions,null))
        .catch( err => callback(null,err));
    },

    findTransactions(args){
        const callback = args[1];
        if ( callback === undefined )
            return Utils.injectPromise(this.request, 'findTransactions', {args});

        this.request('findTransactions', {args})
        .then(transactions => callback(transactions,null))
        .catch( err => callback(null,err));
    },

    getAccountData(args){
        let callback;
        args[1] ? callback = args[1] : callback = args[0];

        if ( callback === undefined )
            return Utils.injectPromise(this.request, 'getAccountData', {args});
    
        this.request('getAccountData', {args})
        .then(data => callback(data,null))
        .catch( err => callback(null,err));
    },

    getBalances(args){
        const callback = args[2];
        if ( callback === undefined )
            return Utils.injectPromise(this.request, 'getBalances', {args});

        this.request('getBalances',{args})
        .then(balances  => callback(balances,null))
        .catch(err => callback(null,err));
    },

    getBundle(args){
        const callback = args[1];
        if ( callback === undefined )
            return Utils.injectPromise(this.request, 'getBundle', {args});

        this.request('getBundle',{args})
        .then(bundle  => callback(bundle,null))
        .catch(err => callback(null,err));
    },

    getInclusionStates(args){
        const callback = args[2];
        if ( callback === undefined )
            return Utils.injectPromise(this.request, 'getInclusionStates', {args});

        this.request('getInclusionStates',{args})
        .then(states  => callback(states,null))
        .catch(err => callback(null,err));
    },

    getInputs(args){
        let callback;
        args[1] ? callback = args[1] : callback = args[0];
        if ( callback === undefined )
            return Utils.injectPromise(this.request, 'getInputs', {args});
    
        this.request('getInputs', {args})
        .then(data => callback(data,null))
        .catch( err => callback(null,err));
    },

    getLatestInclusion(args){
        let callback;
        args[2] ? callback = args[2] : callback = args[1];
        if ( callback === undefined )
            return Utils.injectPromise(this.request, 'getLatestInclusion', {args});
    
        this.request('getLatestInclusion', {args})
        .then(states => callback(states,null))
        .catch( err => callback(null,err));
    },

    getNeighbors(args){
        const callback = args[0];
        if ( callback === undefined )
            return Utils.injectPromise(this.request, 'getNeighbors', {args});

        this.request('getNeighbors')
        .then(info => callback(info,null))
        .catch( err => callback(null,err));
    },

    getNewAddress(args){
        let callback;
        args[1] ? callback = args[1] : callback = args[0];
        if ( callback === undefined )
            return Utils.injectPromise(this.request, 'getNewAddress', {args});
    
        this.request('getNewAddress', {args})
        .then(address => callback(address,null))
        .catch( err => callback(null,err));
    },

    getNodeInfo(args){
        const callback = args[0];
        if ( callback === undefined )
            return Utils.injectPromise(this.request, 'getNodeInfo');

        this.request('getNodeInfo')
        .then(info => callback(info,null))
        .catch( err => callback(null,err));
    },

    getTips(args){
        const callback = args[0];
        if ( callback === undefined )
            return Utils.injectPromise(this.request, 'getTips');

        this.request('getTips')
        .then(tips => callback(tips,null))
        .catch( err => callback(null,err));
    },

    getTransactionObjects(args){
        const callback = args[1];
        if ( callback === undefined )
            return Utils.injectPromise(this.request, 'getTransactionObjects', {args});

        this.request('getTransactionObjects',{args})
        .then(transaction  => callback(transaction,null))
        .catch(err => callback(null,err));
    },

    getTransactionsToApprove(args){
        let callback;
        args[2] ? callback = args[2] : callback = args[1];
        if ( callback === undefined )
            return Utils.injectPromise(this.request, 'getTransactionsToApprove', {args});
    
        this.request('getTransactionsToApprove', {args})
        .then(transactions => callback(transactions,null))
        .catch( err => callback(null,err));
    },

    getTrytes(args){
        const callback = args[1];
        if ( callback === undefined )
            return Utils.injectPromise(this.request, 'getTrytes', {args});

        this.request('getTrytes',{args})
        .then(trytes  => callback(trytes,null))
        .catch(err => callback(null,err));
    },

    isPromotable(args){
        const callback = args[1];
        if ( callback === undefined )
            return Utils.injectPromise(this.request, 'isPromotable', {args});   

        this.request('isPromotable',{args})
        .then(isPromotable  => callback(isPromotable,null))
        .catch(err => callback(null,err));
    },

    prepareTransfers(args){
        let callback;
        args[2] ? callback = args[2] : callback = args[1];
        args = [args[0]]; 
        if ( callback === undefined )
            return Utils.injectPromise(this.request, 'prepareTransfer', {args});        
        
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
        args = [args[0]];
        if ( callback === undefined )
            return Utils.injectPromise(this.request, 'promoteTransaction', {args});        

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
            return Utils.injectPromise(this.request, 'removeNeighbors', {args});

        this.request('removeNeighbors',{args})
        .then(state  => callback(state,null))
        .catch(err => callback(null,err));
    },

    replayBundle(args){
        const callback = args[3];
        if ( callback === undefined )
            return Utils.injectPromise(this.request, 'replayBundle', {args});

        this.request('replayBundle',{args})
        .then(reattachedTail  => callback(reattachedTail,null))
        .catch(err => callback(null,err));
    },

    sendTrytes(args){
        let callback;
        args[4] ? callback = args[4] : callback = args[3];
        args = [args[0]];
        if ( callback === undefined )
            return Utils.injectPromise(this.request, 'sendTrytes', {args});
        
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
            return Utils.injectPromise(this.request, 'storeAndBroadcast', {args});

        this.request('storeAndBroadcast',{args})
        .then(trytes  => callback(trytes,null))
        .catch(err => callback(null,err));
    },

    storeTransactions(args){
        const callback = args[1];
        if ( callback === undefined )
            return Utils.injectPromise(this.request, 'storeTransactions', {args});

        this.request('storeTransactions',{args})
        .then(trytes  => callback(trytes,null))
        .catch(err => callback(null,err));
    },

    traverseBundle(args){
        let callback;
        args[2] ? callback = args[2] : callback = args[1];
        if ( callback === undefined )
            return Utils.injectPromise(this.request, 'traverseBundle', {args});
        
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
            return Utils.injectPromise(this.request, 'generateAddress', {args});
        
        this.request('generateAddress', {args})
        .then(address => {
            callback(address,null)
        }).catch(err => {
            callback(null,err);
        });
    }


}