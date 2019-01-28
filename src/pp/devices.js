const {iotaInit} = require('../core/core');
const {trytesToAscii} = require('@iota/converter')


const fetchDevices = async provider => {
   
    const options = {tags : ["GADDTCVCPCGDIDGDGA999999999"]};
   
    const iota = await iotaInit('https://nodes.devnet.iota.org:443')
    const transactions = await iota.findTransactionObjects(options);
    console.log(transactions)

    const devices = [];
    transactions.forEach ( transaction => {
        const device = trytesToAscii(transaction.signatureMessageFragment.substring(0,transactions[0].signatureMessageFragment.length-1));
        try{
            const obj = JSON.parse(device.replace(/\0.*$/g,''))
            //if ( obj.name && obj.address && obj.lat && obj.lon ){
                devices.push(obj);
            //}
        }catch(err){}
    })
        
    //remove devices with same name
    const arrayDeviceName = []
    const newDevices = []
    devices.forEach ( device => {
        if ( device.message )
            if ( !arrayDeviceName.includes(device.message.name) ){
                arrayDeviceName.push(device.message.name);
                newDevices.push(device.message);
            }
    })
    return newDevices;
}



const receiveFirstRoot = async (provider,addresses) => {

    const options = {
        addresses : addresses,
        tags : ["GADDTCVCPCGDIDGDGA999999999"]};
   
    const iota = await iotaInit('https://nodes.devnet.iota.org:443')
    const transactions = await iota.findTransactionObjects(options);
    console.log(transactions)
    
    const channels = [];
    transactions.forEach ( transaction => {
        try{
            const channel = trytesToAscii(transaction.signatureMessageFragment.substring(0,transactions[0].signatureMessageFragment.length-1)).replace(/\0.*$/g,'');
            console.log(channel);
            if ( channel.state && channel.deviceName ){
                channels.push(channel);
            }
        }catch(err){}
    });
    return channels;
}


export {
    fetchDevices,
    receiveFirstRoot
}