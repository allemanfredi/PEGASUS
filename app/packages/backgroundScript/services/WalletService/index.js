
import EventEmitter from 'eventemitter3';

import Utils from '@pegasus/lib/utils';


class Wallet extends EventEmitter {
    
    constructor() {
        super();
    }

    isWalletSetup(){
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

    setupWallet(){
        try{
            localStorage.setItem('data', JSON.stringify({ mainnet: [], testnet: [] }));
            return true;
        }
        catch(err) {
            return false;
        }
    };

    storePsw(psw){
        const hash = Utils.sha256(psw);
        try{
            localStorage.setItem('hpsw', hash);
            return true;
        }
        catch(err) {
            console.log(err);
            return false;
        }
    }

    checkPsw(psw){
        const hash = Utils.sha256(psw);
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
    }

    getKey(){
        try{
            const key = localStorage.getItem('hpsw');
            return key;
        }
        catch(err) {
            throw new Error(err);
        } 
    }

    //return the account with current = true and the reletated network
    setCurrentNetwork(network){
        try{
            const options = JSON.parse(localStorage.getItem('options'));
            options.network = network;
            localStorage.setItem('options', JSON.stringify(options));
            return;
        }catch(e) {
            throw new Error(err);
        }
    }

    getCurrentNewtwork(){
        try{
            const options = JSON.parse(localStorage.getItem('options'));
            if ( !options ) {
                localStorage.setItem('options', JSON.stringify({}));
                return {};
            }
            return options.network;
        }catch(e) {
            throw new Error(err);
        }
    }

    addAccount({account, network, isCurrent}){
        //preparing object to store
        if ( isCurrent ) {
            const data = JSON.parse(localStorage.getItem('data'));
            data[ network.type ].forEach( account => { account.current = false; });
            localStorage.setItem('data', JSON.stringify(data));
        }

        const key = this.getKey();
        const eseed = Utils.aes256encrypt(account.seed, key);

        const obj = {
            name: account.name,
            seed: eseed,
            data: account.data,
            current: isCurrent ? true : false,
            id: Utils.sha256(name),
            network: account.network, //mainnet or testnet
            marketplace: { keys: Utils.generateKeys(), channels: [] }
        };
        try{
            const data = JSON.parse(localStorage.getItem('data'));
            data[ network.type ].push(obj);

            localStorage.setItem('data', JSON.stringify(data));
            return obj;
        }
        catch(err) {
            throw new Error(err);
        }
    }

    setCurrentAccount({currentAccount, network}){
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
            return currentAccount;
        }
        catch(err) {
            throw new Error(err);
        }
       
    }

    resetData(){
        try{
            localStorage.setItem('data', JSON.stringify({ mainnet: [], testnet: [] }));
            return;
        }
        catch(err) {
            throw new Error(err);
        }
    };

    updateDataAccount({newData, network}){
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
            return updatedAccount;
        }
        catch(err) {
            throw new Error(err);
        }
        
    }

    updateNameAccount({current, network, newName}){
        try{
            const data = JSON.parse(localStorage.getItem('data'));
            let updatedAccount = {};
            data[ network.type ].forEach(account => {
                if ( account.id === current.id && account.network.type === current.network.type) {
                    account.name = newName;
                    account.id = Utils.sha256(newName);
                    updatedAccount = account;
                }
            });
            localStorage.setItem('data', JSON.stringify(data));
            return updatedAccount;
        }
        catch(err) {
            throw new Error(err);
        }
        
    }

    deleteAccount({account, network}){
        try{
            const data = JSON.parse(localStorage.getItem('data'));
            if ( data[ network.type ].length === 1)
                reject(new Error('Impossibile to delete this account'));
            else{
                //remove account
                const app = data[ network.type ].filter( acc => acc.id !== account.id);

                //reset the current status
                app.forEach( account => { account.current = false; });

                //set the new current account (the first one of this network)
                app[ 0 ].current = true;
                data[ network.type ] = app;

                localStorage.setItem('data', JSON.stringify(data));
                return account;
            }
        }
        catch(err) {
            throw new Error(err);
        }
    }

    getCurrentAccount(network){
        try{
            const accounts = JSON.parse(localStorage.getItem('data'))[ network.type ];
            for ( let account of accounts){
                if ( account.current ){
                    return account;
                }
            }
            throw new Error('Account not found');
        }
        catch(err) {
            throw new Error(err);
        }
    }

    getAllAccounts(network){
        const accounts = [];
        try{
            JSON.parse(localStorage.getItem('data'))[ network.type ].forEach(account => {
                accounts.push(account);
            });
            return accounts;
        }
        catch(err) {
            throw new Error(err);
        }
    }

    generateSeed(length = 81){
        const bytes = Utils.randomBytes(length, 27);
        const seed = bytes.map(byte => Utils.byteToChar(byte));
        return seed;
    }

    isSeedValid(seed){
        const values = ['9', 'A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z'];
        if ( seed.length !== 81 )
            return false;
        [...seed].forEach(c => {
            if ( values.indexOf(c) === -1)
                return false;
        });
        return true;
    }

    startSession(){
        try{
            const date = new Date();
            localStorage.setItem('session', date.getTime());
            return true;
        }
        catch(err) {
            console.log(err);
            return false;
        }
    }

    checkSession(){
        try{
            const time = localStorage.getItem('session');
            const date = new Date();
            const currentTime = date.getTime();
            if ( currentTime - time > 3600000 ) //greather than 1 our
                return false;
            return true;
        }
        catch(err) {
            console.log(err);
            return false;
        }
    }

    deleteSession(){
        try{
            localStorage.removeItem('session');
            return true;
        }
        catch(err) {
            console.log(err);
            return false;
        }
    }

}

export default Wallet;
