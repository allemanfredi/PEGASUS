import {composeAPI} from '@iota/core';

const CustomizatorService = {

    init(provider){
        this.setProvider({provider});
    },

    setProvider(provider){
        this.iota = composeAPI({provider});
    },

    async request(method , { uuid , resolve , seed , data }){
        
        try{
            switch (method){
                case 'addNeighbors': {
                    this.iota.addNeighbors(data.args[0])
                    .then(numAdded => resolve({ data:numAdded, success:true,uuid }))
                    .catch(err => resolve({ data:err.message, success:false,uuid }))
                    break
                }
                case 'attachToTangle': {
                    this.iota.attachToTangle(data.args[0],data.args[1],data.args[2],data.args[3])
                    .then(trytes => resolve({ data:trytes, success:true, uuid }))
                    .catch(err => resolve({ data:err.message, success:false, uuid }))
                    break
                }
                case 'broadcastBundle' : {
                    this.iota.broadcastBundle(data.args[0])
                    .then(transactions => resolve({ data:transactions, success:true, uuid }))
                    .catch(err => resolve({ data:err.message, success:false, uuid }))
                    break
                }
                case 'getNodeInfo' : {
                    this.iota.getNodeInfo()
                    .then(info => resolve({ data:info, success:true, uuid }))
                    .catch(err => resolve({ data:err.message, success:false, uuid }))
                    break;
                }  
            }
        }catch(err){
            resolve({ data:err.message, success:false, uuid });
        }
        
    }
    
}

export default CustomizatorService;