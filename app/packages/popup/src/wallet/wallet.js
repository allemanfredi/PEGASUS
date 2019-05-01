import { sha256, randomBytes } from '../utils/crypto';
import { byteToChar } from '../utils/helpers';

const isWalletSetup = () => {
    try{
        const data = JSON.parse(localStorage.getItem('data'));
        if ( data.mainnet.length > 0 || data.testnet.length > 0)
            return true;
        return false;
    }
    catch(err) {
        return false;
    }
};

const setupWallet = () => {
    try{
        localStorage.setItem('data', JSON.stringify({ mainnet: [], testnet: [] }));
        return true;
    }
    catch(err) {
        return false;
    }
};

const storePsw = (psw) => {
    const hash = sha256(psw);
    try{
        localStorage.setItem('hpsw', hash);
        sessionStorage.setItem('key', psw);
        return true;
    }
    catch(err) {
        console.log(err);
        return false;
    }
};

const checkPsw = (psw) => {
    const hash = sha256(psw);
    try{
        let pswToCompare;
        if ( ( pswToCompare = localStorage.getItem('hpsw')) === null )
            return false;
        if ( pswToCompare === hash )
            return true;
        return false;
    }
    catch(err) {
        console.log(err);
        return false;
    }
};

const getKey = async () => {
    return new Promise((resolve, reject) => {
        try{
            const key = localStorage.getItem('hpsw');
            resolve(key);
        }
        catch(err) {
            console.log(err);
            reject(err);
        }
    });
};

//return the account with current = true and the reletated network
const setCurrentNetwork = async (network) => {
    return new Promise((resolve, reject) => {
        try{
            const options = JSON.parse(localStorage.getItem('options'));
            options.network = network;
            localStorage.setItem('options', JSON.stringify(options));
            resolve();
        }catch(e) {
            reject(e);
        }
    });
};

const getCurrentNetwork = async () => {
    return new Promise((resolve, reject) => {
        try{
            const options = JSON.parse(localStorage.getItem('options'));
            if ( !options ) {
                localStorage.setItem('options', JSON.stringify({}));
                resolve(null);
            }
            resolve(options.network);
        }catch(e) {
            reject(e);
        }
    });
};

const addAccount = async (account, network, isCurrent) => {
    //preparing object to store
    return new Promise((resolve, reject) => {
        if ( isCurrent ) {
            const data = JSON.parse(localStorage.getItem('data'));
            data[ network.type ].forEach( account => { account.current = false; });
            localStorage.setItem('data', JSON.stringify(data));
        }

        const obj = {
            name: account.name,
            seed: account.seed,
            data: account.data,
            current: isCurrent ? true : false,
            id: account.id,
            network: account.network, //mainnet or testnet
            marketplace: account.marketplace
        };
        try{
            const data = JSON.parse(localStorage.getItem('data'));
            data[ network.type ].push(obj);

            localStorage.setItem('data', JSON.stringify(data));
            resolve(obj);
        }
        catch(err) {
            console.log(err);
            reject(err);
        }
    });
};

const setCurrentAccount = async (currentAccount, network) => {
    return new Promise( (resolve, reject) => {
        const data = JSON.parse(localStorage.getItem('data'));
        data[ network.type ].forEach( account => { account.current = false; });
        localStorage.setItem('data', JSON.stringify(data));

        try{
            const data = JSON.parse(localStorage.getItem('data'));
            data[ network.type ].forEach(account => {
                if ( account.id === currentAccount.id)
                    account.current = true;
            });
            localStorage.setItem('data', JSON.stringify(data));
            resolve(currentAccount);
        }
        catch(err) {
            console.log(err);
            reject(err);
        }
    });
};

const resetData = async () => {
    return new Promise( (resolve, reject) => {
        try{
            localStorage.setItem('data', JSON.stringify({ mainnet: [], testnet: [] }));
            resolve();
        }
        catch(err) {
            console.log(err);
            reject(err);
        }
    });
};

const updateDataAccount = async (newData, network) => {
    return new Promise( (resolve, reject) => {
        try{
            const data = JSON.parse(localStorage.getItem('data'));
            let updatedAccount = {};
            data[ network.type ].forEach(account => {
                if ( account.current ) {
                    account.data = newData;
                    updatedAccount = account;
                }
            });
            localStorage.setItem('data', JSON.stringify(data));
            resolve(updatedAccount);
        }
        catch(err) {
            console.log(err);
            reject(err);
        }
    });
};

const updateNameAccount = async (current, network, newName) => {
    return new Promise( (resolve, reject) => {
        try{
            const data = JSON.parse(localStorage.getItem('data'));
            let updatedAccount = {};
            data[ network.type ].forEach(account => {
                if ( account.id === current.id && account.network.type === current.network.type) {
                    account.name = newName;
                    account.id = sha256(newName);
                    updatedAccount = account;
                }
            });
            localStorage.setItem('data', JSON.stringify(data));
            resolve(updatedAccount);
        }
        catch(err) {
            console.log(err);
            reject(err);
        }
    });
};

const deleteAccount = async (account, network) => {
    return new Promise( (resolve, reject) => {
        try{
            const data = JSON.parse(localStorage.getItem('data'));
            if ( data[ network.type ].length === 1)
                reject(new Error('Impossibile to delete this account'));
            else{
                //remove account
                console.log(account);
                console.log(data);
                const app = data[ network.type ].filter( acc => acc.id !== account.id);
                console.log(app);

                //reset the current status
                app.forEach( account => { account.current = false; });

                //set the new current account (the first one of this network)
                app[ 0 ].current = true;
                data[ network.type ] = app;

                localStorage.setItem('data', JSON.stringify(data));
                resolve(account);
            }
        }
        catch(err) {
            console.log(err);
            reject(err);
        }
    });
};

const getCurrentAccount = async (network) => {
    return new Promise( (resolve, reject) => {
        try{
            JSON.parse(localStorage.getItem('data'))[ network.type ].forEach(account => {
                if ( account.current)
                    resolve(account);
            });
            //se arrivo qua significa che per un tipo di rete non è stato ancora creato un account
            resolve(null);
        }
        catch(err) {
            console.log(err);
            reject(err);
        }
    });
};

const getAllAccounts = async (network) => {
    return new Promise( (resolve, reject) => {
        const accounts = [];
        try{
            JSON.parse(localStorage.getItem('data'))[ network.type ].forEach(account => {
                accounts.push(account);
            });
            resolve(accounts);
        }
        catch(err) {
            console.log(err);
            reject(err);
        }
    });
};

const generateSeed = (length = 81) => {
    const bytes = randomBytes(length, 27);
    const seed = bytes.map(byte => byteToChar(byte));
    return seed;
};

const isSeedValid = (seed) => {
    const values = ['9', 'A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z'];
    if ( seed.length !== 81 )
        return false;
    [...seed].forEach(c => {
        if ( values.indexOf(c) === -1)
            return false;
    });
    return true;
};

/*controls that uses network have been made in order to distinguish between mainnet and testnet
* ex: it is possibile to have two equals account name, one for the testnet and one for the mainnet */

/* M A R K E T P L A C E   F U N C T I O N S */

const storeChannels = async (network, channels) => {
    return new Promise((resolve, reject) => {
        try{
            const data = JSON.parse(localStorage.getItem('data'));
            data[ network.type ].forEach( account => {
                if ( account.current )
                    account.marketplace.channels = channels;
            });
            localStorage.setItem('data', JSON.stringify(data));
            resolve(channels);
        }catch(err) {
            reject(err);
        }
    });
};

const getChannels = async network => {
    return new Promise((resolve, reject) => {
        try{
            const data = JSON.parse(localStorage.getItem('data'));
            console.log(data);
            data[ network.type ].forEach( account => {
                if ( account.current ) {
                    console.log(account.marketplace.channels);
                    resolve(account.marketplace.channels);
                }
            });
        }catch(err) {
            reject(err);
        }
    });
};

export { isWalletSetup,
    storePsw,
    addAccount,
    setupWallet,
    checkPsw,
    generateSeed,
    getCurrentAccount,
    getKey,
    updateDataAccount,
    setCurrentNetwork,
    getCurrentNetwork,
    getAllAccounts,
    setCurrentAccount,
    resetData,
    isSeedValid,
    updateNameAccount,
    deleteAccount,
    getChannels,
    storeChannels };
