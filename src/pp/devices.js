const {iotaInit} = require('../core/core');
const {trytesToAscii} = require('@iota/converter')


const fetchDevices = async provider => {
   
    const options = {tags : ["GADDTCVCPCGDIDGDGA999999999"]};
    const iota = await iotaInit('https://nodes.devnet.iota.org:443')
    let transactions = await iota.findTransactionObjects(options);

    const devices = [];
    transactions.forEach ( transaction => {
        const device = trytesToAscii(transaction.signatureMessageFragment.substring(0,transactions[0].signatureMessageFragment.length-1));
        devices.push(JSON.parse(device.replace(/\0.*$/g,'')));
    })
        
    //remove devices with same name
    const arrayDeviceName = []
    const newDevices = []
    devices.forEach ( device => {
        if ( !arrayDeviceName.includes(device.message.name)){
            arrayDeviceName.push(device.message.name);
            newDevices.push(device.message);
        }
    })
    return newDevices;
}


export {
    fetchDevices
}