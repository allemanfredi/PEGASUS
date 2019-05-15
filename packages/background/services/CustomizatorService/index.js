import {composeAPI} from '@iota/core';

class CustomizatorService {

    constructor(provider){        
        this.iota = composeAPI({provider});
    }

    setProvider(provider){
        this.iota = composeAPI({provider});
    }

    async request(method , { uuid , resolve , seed , data }){
        
        try{
            switch (method){
                case 'addNeighbors': {
                    this.iota.addNeighbors(...data.args)
                    .then(numAdded => resolve({ data:numAdded , success:true , uuid }))
                    .catch(err => resolve({ data:err.message , success:false  , uuid }))
                    break
                }
                case 'attachToTangle': {
                    this.iota.attachToTangle(...data.args)
                    .then(trytes => resolve({ data:trytes , success:true , uuid }))
                    .catch(err => resolve({ data:err.message , success:false , uuid }))
                    break
                }
                case 'broadcastBundle' : {
                    this.iota.broadcastBundle(...data.args)
                    .then(transactions => resolve({ data:transactions , success:true , uuid }))
                    .catch(err => resolve({ data:err.message , success:false , uuid }))
                    break
                }
                case 'broadcastTransactions' : {
                    this.iota.broadcastTransactions(...data.args)
                    .then(trytes => resolve({ data:trytes , success:true , uuid }))
                    .catch(err => resolve({ data:err.message , success:false , uuid }))
                    break
                }
                case 'checkConsistency' : {
                    this.iota.checkConsistency(...data.args)
                    .then(isConsistent => resolve({ data:isConsistent, success:true, uuid }))
                    .catch(err => resolve({ data:err.message , success:false , uuid }))
                    break
                }
                case 'findTransactionObjects' : {
                    this.iota.findTransactionObjects(...data.args)
                    .then(transactions => resolve({ data:transactions, success:true, uuid }))
                    .catch(err => resolve({ data:err.message , success:false , uuid }))
                    break
                }
                case 'findTransactions' : {
                    this.iota.findTransactions(...data.args)
                    .then(transactions => resolve({ data:transactions, success:true, uuid }))
                    .catch(err => resolve({ data:err.message , success:false, uuid }))
                    break
                }
                case 'getAccountData' : {
                    this.iota.getAccountData(seed , ...data.args)
                    .then(data => resolve({ data , success:true, uuid }))
                    .catch(err => resolve({ data:err.message , success:false, uuid }))
                    break
                }
                case 'getBalances' : {
                    this.iota.getBalances(...data.args)
                    .then(({balances}) => resolve({ data:balances , success:true, uuid }))
                    .catch(err => resolve({ data:err.message , success:false, uuid }))
                    break
                }
                case 'getBundle' : {
                    this.iota.getBundle(...data.args)
                    .then( bundle => resolve({ data:bundle , success:true, uuid }))
                    .catch(err => resolve({ data:err.message , success:false, uuid }))
                    break
                }
                case 'getInclusionStates' : {
                    this.iota.getInclusionStates(...data.args)
                    .then( states => resolve({ data:states , success:true, uuid }))
                    .catch(err => resolve({ data:err.message , success:false, uuid }))
                    break
                }
                case 'getNodeInfo' : {
                    this.iota.getNodeInfo()
                    .then(info => resolve({ data:info, success:true, uuid }))
                    .catch(err => resolve({ data:err.message , success:false, uuid }))
                    break;
                }  
            }
        }catch(err){
            resolve({ data:err.message, success:false, uuid });
        }
        
    }
    
}

export default CustomizatorService;