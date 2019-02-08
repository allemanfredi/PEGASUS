const {iotaInit} = require('../core/core');
const {trytesToAscii} = require('@iota/converter')


const fetchDevices = async provider => {
   
    const options = {tags : ["GADDTCVCPCGDIDGDGDGA9999999"]};
   
    const iota = await iotaInit('https://nodes.devnet.iota.org:443')
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



const receiveFirstRoot = async (provider,addresses) => {

    const iota = await iotaInit('https://nodes.devnet.iota.org:443');

    const options = {
        addresses : addresses
    };
    const transactions = await iota.findTransactionObjects(options);
    
    const channels = [];
    const deviceNames = [];
    transactions.forEach ( transaction => {
        try{
            const channel = JSON.parse(trytesToAscii(transaction.signatureMessageFragment.substring(0,transactions[0].signatureMessageFragment.length-1)).replace(/\0.*$/g,''));
            if ( channel.next_root && channel.deviceName && !deviceNames.includes(channel.deviceName) ){
                channels.push(channel);
                deviceNames.push(channel.deviceName);
            }
        }catch(err){}
    });
    return channels;
}





export {
    fetchDevices,
    receiveFirstRoot
}