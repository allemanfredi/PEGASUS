import Mam from 'mam.client.js';
import { asciiToTrytes, trytesToAscii } from '@iota/converter';

const init = (provider, seed) => {
    const state = Mam.init(provider, seed);
    return state;
};

const publish = async (packet, state) => {
    // Create MAM Payload - STRING OF TRYTES
    const trytes = asciiToTrytes(JSON.stringify(packet));
    const message = Mam.create(state, trytes);

    // Attach the payload
    await Mam.attach(message.payload, message.address, 3, 9);

    console.log('Published', packet, '\n');
    return message;
};

const fetch = (provider, root, mode, key, reportEvent) => {
    if (!provider || !root) return;
    return new Promise(async (resolve, reject) => {
        try {
            Mam.init(provider);
            //const convertAndReport = event => reportEvent(JSON.parse(trytesToAscii(event)))
            //await Mam.fetch(root, mode, null, convertAndReport);

            const result = await Mam.fetch(root, mode, key);
            //result.messages.forEach(message => console.log('Fetched and parsed', JSON.parse(trytesToAscii(message)), '\n'))
            console.log(result);
            resolve(result);
        } catch (error) {
            console.log('MAM fetch error', error);
            reject();
        }
    });
};

//const logData = data => console.log('Fetched and parsed', JSON.parse(trytesToAscii(data)), '\n')

export {
    publish,
    fetch,
    init
};
