const Mam = require('mam.client.js');
const { asciiToTrytes, trytesToAscii } =  require('@iota/converter');


const init = (provider,seed) => {
    const state = Mam.init(provider,seed);
    return state;
}

const publish = async (packet,state) => {
    // Create MAM Payload - STRING OF TRYTES
    const trytes = asciiToTrytes(JSON.stringify(packet));
    const message = Mam.create(state, trytes);

    // Attach the payload
    await Mam.attach(message.payload, message.address, 3, 14)

    console.log('Published', packet, '\n');
    return message;
}

const fetch = (provider, root, mode, key, reportEvent) => {
    if (!provider || !root) return;
    return new Promise(async (resolve, reject) => {
      try {
        Mam.init(provider);
        const convertAndReport = event => reportEvent(JSON.parse(trytesToAscii(event)))
        await Mam.fetch(root, mode, key, convertAndReport);
      } catch (error) {
        console.log('MAM fetch error', error);
        reject();
      }
    });
};

const changeMode = (state, mode, secretKey) => {
  const newState = Mam.changeMode(state, mode, secretKey);
  return newState;

}

const logData = data => console.log('Fetched and parsed', JSON.parse(trytesToAscii(data)), '\n')


module.exports =  {
    publish,
    fetch,
    init,
    changeMode
}
