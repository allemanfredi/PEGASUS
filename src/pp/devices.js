import {decryptWithRsaPrivateKey} from '../utils/crypto'
const {iotaInit,getMessage} = require('../core/core');
const {trytesToAscii} = require('@iota/converter')

const tag = "GADDTCVCPCGDIDGDJDVAGA99999"

const fetchDevices = async provider => {
   
    const options = {tags : [tag]};
   
    const iota = await iotaInit(provider)
    const transactions = await iota.findTransactionObjects(options);

    const devices = [];
    transactions.forEach ( transaction => {
        const device = trytesToAscii(transaction.signatureMessageFragment.substring(0,transactions[0].signatureMessageFragment.length-1));
        try{
            const obj = JSON.parse(device.replace(/\0.*$/g,''));
            if ( obj.name && obj.address && obj.lat && obj.lon ){
                devices.push(obj);
            }
        }catch(err){}
    })
        
    //remove devices with same name
    const arrayDeviceName = []
    const newDevices = []
    devices.forEach ( device => {
        if ( !arrayDeviceName.includes(device.name) ){
            arrayDeviceName.push(device.name);
            newDevices.push(device);
        }
    })
    return newDevices;
}



const receiveSideKeyAndFirstRoot = async (provider,account) => {
    
    const iota = await iotaInit(provider);

    const options = {
        addresses : account.data.addresses,
        tags : [tag]
    };
    const transactions = await iota.findTransactionObjects(options);
    const res = [];    

    for ( let transaction of transactions ){
        if ( transaction.currentIndex === 0 ){
            try{
                let message = await getMessage(transaction.hash)//JSON.parse(trytesToAscii(transaction.signatureMessageFragment.substring(0,transaction.signatureMessageFragment.length-1)).replace(/\0.*$/g,''));
                if ( message.sidekey && message.root ){
                    message.root = decryptWithRsaPrivateKey(message.root,account.marketplace.keys.privateKey);
                    message.sidekey = decryptWithRsaPrivateKey(message.sidekey,account.marketplace.keys.privateKey);
                    res.push(message);
                }
            }catch(err){}
        }
    }
    
    return res;
}



export {
    fetchDevices,
    receiveSideKeyAndFirstRoot
}