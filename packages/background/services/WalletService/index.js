
import EventEmitter from 'eventemitter3';
import extensionizer from 'extensionizer';
import Utils from '@pegasus/lib/utils';

import { BackgroundAPI } from '@pegasus/lib/api';
import {APP_STATE} from '@pegasus/lib/states';

import { composeAPI } from '@iota/core';
import settings from '@pegasus/lib/options';

import AccountDataService from '../AccountDataService'
import CustomizatorService from '../CustomizatorService'

class Wallet extends EventEmitter {
    
    constructor() {
        super();

        this.popup = false;
        this.payments = [];
        this.password = false;
        this.accountDataHandler = false;

        if ( !this.isWalletSetup() ){
            this.setupWallet();
        }

        const currentNetwork = this.getCurrentNetwork();
        if (  Object.entries(currentNetwork).length === 0 && currentNetwork.constructor === Object ) {
           this.setCurrentNetwork(settings.network[ 0 ]);
        }

        this.checkSession();
        this.setInterval ( this.checkSession , 900000);
        
        //iotajs injection service
        CustomizatorService.init(currentNetwork.provider);
    }

    isWalletSetup(){
        try{
            const data = JSON.parse(localStorage.getItem('data'));
            if ( !data )
                return false;

            const state = this.getState();
            if ( ( data.mainnet.length > 0 || data.testnet.length > 0 ) && state >= APP_STATE.WALLET_INITIALIZED)
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
            this.setState(APP_STATE.WALLET_NOT_INITIALIZED);
            return true;
        }
        catch(err) {
            this.setState(APP_STATE.WALLET_NOT_INITIALIZED);
            return false;
        }
    };

    storePassword(psw){
        const hash = Utils.sha256(psw);
        try{
            this.password = psw;
            localStorage.setItem('hpsw', hash);
            return true;
        }
        catch(err) {
            console.log(err);
            return false;
        }
    }

    setPassword(password){
        this.password = password;
    }

    unlockWallet(psw){
        const hash = Utils.sha256(psw);
        try{
            let pswToCompare;
            if ( ( pswToCompare = localStorage.getItem('hpsw')) === null )
                return false;
            if ( pswToCompare === hash ){
                const network = this.getCurrentNetwork();
                const account = this.getCurrentAccount(network);
                this.emit('setAccount',account);

                return true;
            }
            return false;
        }
        catch(err) {
            console.log(err);
            return false;
        }
    }

    getKey(){
        return this.password;
    }

    _getCurrentSeed(){
        const network = this.getCurrentNetwork();
        const account = this.getCurrentAccount(network);
        const key =  this.getKey();
        const seed = Utils.aes256decrypt(account.seed, key);
        return seed;
    }

    //return the account with current = true and the reletated network
    setCurrentNetwork(network){
        try{
            const options = JSON.parse(localStorage.getItem('options'));
            options.network = network;
            localStorage.setItem('options', JSON.stringify(options));

            //change pagehook
            this.emit('setProvider', network.provider);
            CustomizatorService.setProvider(network.provider);
            
            //handle the init phase ( yes network no account )
            const account = this.getCurrentAccount(network);
            if ( account ){
                this.emit('setAddress', account.data.latestAddress);
                this.emit('setAccount', account);
            }

            return;
        }catch(err) {
            console.log(err);
            throw new Error(err);
        }
    }

    getCurrentNetwork(){
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
            transactions : [],
            data: account.data,
            current: isCurrent ? true : false,
            id: Utils.sha256(account.name),
            network: account.network, //mainnet or testnet
        };
        
        try{
            const data = JSON.parse(localStorage.getItem('data'));
            data[ network.type ].push(obj);
            localStorage.setItem('data', JSON.stringify(data));

            this.emit('setProvider', network.provider);
            this.emit('setAddress', account.data.latestAddress);
            this.emit('setAccount', obj);

            return obj;
        }
        catch(err) {
            throw new Error(err);
        }
    }

    getCurrentAccount(network){
        try{
            const accounts = JSON.parse(localStorage.getItem('data'))[ network.type ];
            const state = this.getState();
            if ( accounts.length === 0 && state == APP_STATE.WALLET_NOT_INITIALIZED ){
                return null;
            }

            for ( let account of accounts){
                if ( account.current ){
                    return account;
                }
            }

            //create an account for testnet if user switch to testnet and there is no accounts
            this.emit('setAccount',{});
            const isCurrent = true;
            const seed = this.generateSeed();
            const account = {
                name : 'account-testnet',
                network : network,
                seed : seed.toString().replace(/,/g, ''),
                data : {}
            }
            const res = this.addAccount({account, network, isCurrent});
            const newData = this.loadAccountData();
            return res;
        }
        catch(err) {
            throw new Error(err);
        }
    }

    setCurrentAccount({currentAccount, network}){
        let data = JSON.parse(localStorage.getItem('data'));
        data[ network.type ].forEach( account => { account.current = false; });
        localStorage.setItem('data', JSON.stringify(data));


        try{
            const data = JSON.parse(localStorage.getItem('data'));
            data[ network.type ].forEach(account => {
                if ( account.id === currentAccount.id){
                    account.current = true;
                    
                    const network = this.getCurrentNetwork();
                    this.emit('setProvider', network.provider);
                    this.emit('setAddress', account.data.latestAddress);
                    this.emit('setAccount', account);
                }
            });
            localStorage.setItem('data', JSON.stringify(data));
        }
        catch(err) {
            console.log(err);
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
            console.log(err);
        }
    };

    updateDataAccount({newData, network}){
        try{
            const data = JSON.parse(localStorage.getItem('data'));
            let updatedAccount = {};
            data[ network.type ].forEach(account => {
                if ( account.current  ) {
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

    updateTransactionsAccount({transactions, network}){
        try{
            const data = JSON.parse(localStorage.getItem('data'));
            let updatedAccount = {};
            data[ network.type ].forEach(account => {
                if ( account.current ) {
                    account.transactions = transactions;
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
            this.emit('setAccount', updatedAccount);
        }
        catch(err) {
            throw new Error(err);
        }
        
    }

    deleteAccount({account, network}){
        try{
            const data = JSON.parse(localStorage.getItem('data'));
            if ( data[ network.type ].length === 1)
                return null;
            else{
                //remove account
                const app = data[ network.type ].filter( acc => acc.id !== account.id);

                //reset the current status
                app.forEach( account => { account.current = false; });

                //set the new current account (the first one of this network)
                app[ 0 ].current = true;
                data[ network.type ] = app;

                localStorage.setItem('data', JSON.stringify(data));
                this.emit('setAccount',app[ 0 ]);
                return app[ 0 ];
            }
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
            this.setState(APP_STATE.WALLET_UNLOCKED);
            return true;
        }
        catch(err) {
            console.log(err);
            return false;
        }
    }

    checkSession(){
        try{

            const currentState = this.getState();
            if ( currentState == APP_STATE.WALLET_TRANSFERS_IN_QUEUE ){
                return;
            }
            
            if ( !this.password && !this.isWalletSetup()){
                this.setState(APP_STATE.WALLET_NOT_INITIALIZED);
                return;
            }

            if ( !this.password ){
                this.setState(APP_STATE.WALLET_LOCKED);
                return;
            }

            const time = localStorage.getItem('session');
            if ( time ){
                const date = new Date();
                const currentTime = date.getTime();
                if ( currentTime - time > 3600000 ){ //greather than 1 our
                    this.setState(APP_STATE.WALLET_LOCKED);
                    return;
                }
                this.setState(APP_STATE.WALLET_UNLOCKED);
                return;
            }else this.password = false;

            if ( currentState <= APP_STATE.WALLET_INITIALIZED ){
                return
            }else{
                this.setState(APP_STATE.WALLET_LOCKED);
                return;
            }
            
        }
        catch(err) {
            console.log(err);
            return false;
        }
    }

    deleteSession(){
        try{
            localStorage.removeItem('session');
            this.setState(APP_STATE.WALLET_LOCKED);
            this.password = false;
            return true;
        }
        catch(err) {
            console.log(err);
            return false;
        }
    }

    async openPopup() {
        if(this.popup && this.popup.closed)
            this.popup = false;

        if(this.popup && await this.updateWindow())
            return;

        if(typeof chrome !== 'undefined') {
            return extensionizer.windows.create({
                url: 'packages/popup/build/index.html',
                type: 'popup',
                width: 380,
                height: 600,
                left: 25,
                top: 25
            }, window => this.popup = window);
        }

        this.popup = await extensionizer.windows.create({
            url: 'packages/popup/build/index.html',
            type: 'popup',
            width: 380,
            height: 600,
            left: 25,
            top: 25
        });
    }

    async closePopup(){
        if(this.payments.length)
            return;

        if(!this.popup)
            return;
        
        extensionizer.windows.remove(this.popup.id);
        this.popup = false;
    }

    async updateWindow() {
        return new Promise(resolve => {
            if(typeof chrome !== 'undefined') {
                return extensionizer.windows.update(this.popup.id, { focused: true }, window => {
                    resolve(!!window);
                });
            }

            extensionizer.windows.update(this.popup.id, {
                focused: true
            }).then(resolve).catch(() => resolve(false));
        });
    }

    setState(state){
        try{
            localStorage.setItem('state',state);
        }catch(err){
            console.log(err);
        }
    }

    getState(){
        const state = localStorage.getItem('state');
        return state;
    }

    pushPayment(payment,uuid,callback){
        
        const currentState = this.getState();
        if ( currentState != APP_STATE.WALLET_LOCKED ){
            this.setState(APP_STATE.WALLET_TRANSFERS_IN_QUEUE);
        }else{
            console.log("locked");
        }

        const obj = {
            payment,
            uuid,
            callback
        }
        
        this.payments.push(obj);
        if (!this.popup && !payment.isPopup){
            this.openPopup();
        }
        
        if ( currentState != APP_STATE.WALLET_LOCKED )
            BackgroundAPI.setPayments(this.payments);
        
        return;
    }

    confirmPayment(payment){

        BackgroundAPI.setConfirmationLoading(true);

        const transfer = payment.payment.args[0][0];
        const network = this.getCurrentNetwork();
        const iota = composeAPI({provider:network.provider});
        const callback = this.payments.filter( obj => obj.uuid === payment.uuid )[0].callback;
        
        const key = this.getKey();
        const account = this.getCurrentAccount(network);
        const seed = Utils.aes256decrypt(account.seed, key);

        const depth = 3;
        const minWeightMagnitude = network.difficulty;

        try{
            iota.prepareTransfers(seed, [transfer])
                .then(trytes => {
                    return iota.sendTrytes(trytes, depth, minWeightMagnitude);
                })
                .then(bundle => {
                    this.removePayment(payment);
                    BackgroundAPI.setPayments(this.payments);
                    this.setState(APP_STATE.WALLET_UNLOCKED);

                    //since every transaction is generated a new address, it's necessary to modify the hook
                    const data = iota.getAccountData(seed).then( data =>  BackgroundAPI.setAddress(data.latestAddress));
                   
                    BackgroundAPI.setConfirmationLoading(false);
                    callback({data:bundle,success:true,uuid: payment.uuid});
                })
                .catch(err => {

                    BackgroundAPI.setConfirmationError(err.message);
                    BackgroundAPI.setConfirmationLoading(false);
                    callback({ data:err.message, success:false,uuid: payment.uuid});
                });
        }catch(err) {

            BackgroundAPI.setConfirmationError(err.message);
            BackgroundAPI.setConfirmationLoading(false);
            callback({data:err.message,success : false,uuid: payment.uuid});
        }

        return;
        
    }

    removePayment(paymentToRemove){
        this.payments = this.payments.filter( payment => payment.uuid !== paymentToRemove.uuid);
        if ( this.payments.length === 0 ){
            this.setState(APP_STATE.WALLET_UNLOCKED);
            this.closePopup();
        }
    }

    getPayments(){
        //remove callback 
        const payments = this.payments.map(obj => {return {payment:obj.payment,uuid:obj.uuid}});
        return payments;
    }

    rejectAllPayments(){
        this.payments = [];
        this.closePopup();
        this.setState(APP_STATE.WALLET_UNLOCKED);
    }

    rejectPayment(rejectedPayment){
        
        const callback = this.payments.filter( obj => rejectedPayment.uuid === obj.uuid )[0].callback;
        this.payments = this.payments.filter( payment => payment.uuid !== rejectedPayment.uuid);

        if ( callback ){
            callback({
                data:"Transaction has been rejected",
                success : false,
                uuid: rejectedPayment.uuid
            });
        }
        
        if ( this.payments.length === 0 ){
            this.setState(APP_STATE.WALLET_UNLOCKED);
            this.closePopup();
        }
    }

    //Account Data Handling
    async loadAccountData(){
        const seed = this._getCurrentSeed();
        const network = this.getCurrentNetwork();
        const {transactions , newData} = await AccountDataService.retrieveAccountData(seed,network.provider);

        //store txs in the localstorage
        this.updateTransactionsAccount({transactions,network});
        const updatedAccount = this.updateDataAccount({newData,network});
        this.emit('setAccount', updatedAccount);
    }

    startHandleAccountData(){
        //first time without loading from the iotajs since are store in the localstorage
        const network = this.getCurrentNetwork();
        const account = this.getCurrentAccount(network);
        this.emit('setAccount', account);

        if ( this.accountDataHandler )
            return;
        
        this.accountDataHandler = setInterval( () => this.loadAccountData , 20000);
    }

    stopHandleAccountData(){
        clearInterval(this.accountDataHandler);
    }

    reloadAccountData(){
        this.emit('setAccount', {});
        this.loadAccountData();
    }

    //CUSTOM iotajs functions
    request(method , {uuid,resolve,data}){
        CustomizatorService.request(method , {uuid , resolve , data})
    }


}

export default Wallet;
