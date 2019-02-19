const {iotaInit} = require('../core/core');
const {trytesToAscii} = require('@iota/converter')


const fetchDevices = async provider => {
   
    const options = {tags : ["GADDTCVCPCGDIDGDGDGA9999999"]};
   
    const iota = await iotaInit('https://nodes.thetangle.org:443')
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



const receiveSideKeyAndFirstRoot = async (provider,addresses) => {
    const iota = await iotaInit('https://nodes.thetangle.org:443');

    const options = {
        addresses : addresses
    };
    const transactions = await iota.findTransactionObjects(options);
    const res = [];

    transactions.forEach( transaction => {
        try{
            const message = JSON.parse(trytesToAscii(transaction.signatureMessageFragment.substring(0,transactions[0].signatureMessageFragment.length-1)).replace(/\0.*$/g,''));
            if ( message.sidekey && message.root ){
                res.push(message);
            }
        }catch(err){}
    });
    return res;
}



export {
    fetchDevices,
    receiveSideKeyAndFirstRoot
}