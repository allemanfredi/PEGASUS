import {composeAPI} from '@iota/core';

const CustomizatorService = {

    init(provider){
        this.setProvider({provider});
    },

    setProvider(provider){
        this.iota = composeAPI({provider});
    },

    async request(method , { uuid , resolve , seed , data }){
        switch (method){
            case 'addNeighbors':{
                this.iota.addNeighbors(data.args[0])
                .then(numAdded => resolve({ data:numAdded, success:true,uuid }))
                .catch(err => resolve({ data:err, success:false,uuid }))
                break
            }
            case 'getNodeInfo' : {
                this.iota.getNodeInfo()
                .then(info => resolve({ data:info, success:true,uuid }))
                .catch(err => resolve({ data:err, success:false,uuid }))
                break;
            }  
        }
    }
    
}

export default CustomizatorService;