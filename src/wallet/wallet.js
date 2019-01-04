import {sha256} from '../utils/crypto';

const isWalletSetup = () => {
    try{
        const data = JSON.parse(localStorage.getItem('data'));
        if (localStorage.getItem('isWalletSetup') === 'true' && data.length > 0)
            return true;
        else
            return false;
    }
    catch(err){
        console.log(err);
        return false;
    } 
}

const setupWallet = () => {
    try{
        localStorage.setItem('isWalletSetup', 'true')
        localStorage.setItem('data' , JSON.stringify([]) )
        return true;
    }
    catch(err){
        console.log(err);
        return false;
    }
}


const storePsw = (psw) => {
    const hash = sha256(psw);
    try{
        localStorage.setItem('hpsw', hash);
        sessionStorage.setItem('key', psw);
        return true;
    }
    catch(err){
        console.log(err);
        return false;
    }
}

const checkPsw = (psw) => {
    const hash = sha256(psw);
    try{
        let pswToCompare;
        if ( ( pswToCompare = localStorage.getItem('hpsw')) === null )
            return false;
        if ( pswToCompare === hash )
            return true; 
        else
            return false;
    }
    catch(err){
        console.log(err);
        return false;
    }
}

const getKey = async () => {
    return new Promise ((resolve,reject) => {
        try{
            const key =  localStorage.getItem('hpsw');
            resolve(key);
        }
        catch(err){
            console.log(err);
            reject(err);
        }
    });
}


//return the account with current = true and the reletated network
const setCurrentNetwork = async (network) => {
    return new Promise ((resolve,reject) => {
        try{
            let options = JSON.parse(localStorage.getItem('options'));
            options['network'] = network;
            localStorage.setItem('options',  JSON.stringify(options));
            resolve();
        }catch(e){
            reject(e);
        }
    })
}

const getCurrentNewtwork = async (network) => {
    return new Promise ((resolve,reject) => {
        try{
            const options = JSON.parse(localStorage.getItem('options'));
            if ( !options ){
                localStorage.setItem('options' , JSON.stringify({}));
                resolve(null);
            }
            resolve(options.network);
        }catch(e){
            reject(e);
        }
    })
}


const addAccount = async (account,isCurrent) => {
    //preparing object to store
    return new Promise((resolve,reject) => {
        
        if(isCurrent){ //reset all accounts current in order to re assign the new current
            let data = JSON.parse(localStorage.getItem('data'));
            data.forEach( account => account.current = false);
            localStorage.setItem('data',JSON.stringify(data));
        }

        const obj = {
            name : account.name,
            seed : account.seed,
            data : account.data,
            current : true,
            id : account.id,
            network : account.network //mainnet or testnet
        }
        try{
    
            let data = JSON.parse(localStorage.getItem('data'));
            data.push(obj);

            localStorage.setItem('data',JSON.stringify(data));
            resolve();
        }
        catch(err){
            console.log(err);
            reject();
        }
    });
    
}

const setCurrentAccount = async (currentAccount,network) => {
    return new Promise ( (resolve,reject) => {
        
        let data = JSON.parse(localStorage.getItem('data'));
        data.forEach( account => account.current = false);
        localStorage.setItem('data',JSON.stringify(data));

        try{
            let data = JSON.parse(localStorage.getItem('data'));
            data.forEach(account => { 
                if ( account.name === currentAccount.name && account.network.type === network.type) {
                    account.current = true;
                } 
            });
            localStorage.setItem('data',JSON.stringify(data));
            resolve(currentAccount);
        }
        catch(err){
            console.log(err);
            reject(err);
        }
    });  
}

const resetData = async () => {
    return new Promise ( (resolve,reject) => {
        try{
            localStorage.setItem('data', JSON.stringify([]));
            resolve();
        }
        catch(err){
            console.log(err);
            reject(err);
        }
    });  
}

const updateDataAccount = async (newData,network) => {
    return new Promise( (resolve,reject) => {
        try{
            let data = JSON.parse(localStorage.getItem('data'));
            let updatedAccount = {};
            data.forEach(account => { 
                if ( account.current && account.network.type === network.type) {
                    account.data = newData;
                    updatedAccount = account;
                } 
            });
            localStorage.setItem('data',JSON.stringify(data));
            resolve(updatedAccount);
        }
        catch(err){
            console.log(err);
            reject(err);
        }
    }); 
}

const getCurrentAccount = async (network) => {
    return new Promise( (resolve,reject) => {
        try{
            JSON.parse(localStorage.getItem('data')).forEach(account => {
                if ( account.current && account.network.type === network.type){
                    resolve(account);
                }
            });

            //se arrivo qua significa che per un tipo di rete non è stato ancora creato un account => creo account
            resolve(null);
        }
        catch(err){
            console.log(err);
            reject(err);
        }
    }); 
}

const getAllAccounts = async (network) => {
    return new Promise( (resolve,reject) => {
        let accounts = [];
        try{
            JSON.parse(localStorage.getItem('data')).forEach(account => {
                if ( account.network.type === network.type)
                    accounts.push(account);
            });
            resolve(accounts);
        }
        catch(err){
            console.log(err);
            reject(err);
        }
    }); 
}

const setCurrentAddress = async (address,network) => {

    return new Promise( (resolve,reject) => {
        try{
            let data = JSON.parse(localStorage.getItem('data'))
            data.forEach(account => { 
                if ( account.current && account.network.type === network.type){
                    account.currentAddress = address; 
                }
            });
            localStorage.setItem('data',JSON.stringify(data));
            resolve();
        }
        catch(err){
            console.log(err);
            reject(err);
        }
    }); 
}

const generateSeed = () => {

    const values = ['9','A','B','C','D','E','F','G','H','I','J','K','L','M','N','O','P','Q','R','S','T','U','V','W','X','Y','Z'];
    let seed = '';
    for (let i = 0; i < 81; i++)
        seed += values[Math.floor(Math.random() * values.length)];
    
    return seed;
}

const isSeedValid = (seed) => {

    const values = ['9','A','B','C','D','E','F','G','H','I','J','K','L','M','N','O','P','Q','R','S','T','U','V','W','X','Y','Z'];
    if ( seed.length !== 81 )
        return false;
    [...seed].forEach(c => {
        if ( values.indexOf(c) === -1)
            return false
    });

    return true;

}



export {isWalletSetup,
        storePsw,
        addAccount,
        setupWallet,
        checkPsw,
        generateSeed,
        getCurrentAccount,
        getKey,
        setCurrentAddress,
        updateDataAccount,
        setCurrentNetwork,
        getCurrentNewtwork,
        getAllAccounts,
        setCurrentAccount,
        resetData,
        isSeedValid};
