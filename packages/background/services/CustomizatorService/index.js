import {composeAPI} from '@iota/core';

const CustomizatorService = {

    init(provider){
        this.setProvider({provider});
    },

    setProvider(provider){
        this.iota = composeAPI({provider});
    },

    //callback({ data:err.message, success:false,uuid: payment.uuid});

    async request(method , { uuid , resolve , seed , options }){
        switch (method){
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