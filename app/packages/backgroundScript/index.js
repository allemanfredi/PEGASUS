import MessageDuplex from '@pegasus/lib/MessageDuplex';
import WalletService from './services/WalletService';
import Utils from '@pegasus/lib/utils';

import { BackgroundAPI } from '@pegasus/lib/api';
import {APP_STATE} from '@pegasus/lib/states';


const duplex = new MessageDuplex.Host();

const backgroundScript = {

    walletService: Utils.requestHandler(
        new WalletService()
    ),

    run() {
        BackgroundAPI.init(duplex);

        this.bindPopupDuplex();
        this.bindTabDuplex();
        this.bindWalletEvents();
    },

    bindPopupDuplex() {
        
        //Wallet Service
        duplex.on('isWalletSetup', this.walletService.isWalletSetup);
        duplex.on('setupWallet', this.walletService.setupWallet);
        duplex.on('checkPsw', this.walletService.checkPsw);
        duplex.on('getKey', this.walletService.getKey);
        duplex.on('storePsw', this.walletService.storePsw);

        duplex.on('setCurrentNetwork', this.walletService.setCurrentNetwork);
        duplex.on('getCurrentNetwork', this.walletService.getCurrentNetwork);
        
        duplex.on('addAccount', this.walletService.addAccount);
        duplex.on('getCurrentAccount', this.walletService.getCurrentAccount);
        duplex.on('setCurrentAccount', this.walletService.setCurrentAccount);
        duplex.on('updateDataAccount', this.walletService.updateDataAccount);
        duplex.on('deleteAccount', this.walletService.deleteAccount);

        duplex.on('resetData', this.walletService.resetData);

        duplex.on('generateSeed', this.walletService.generateSeed);
        duplex.on('isSeedValid', this.walletService.isSeedValid);

        duplex.on('checkSession', this.walletService.checkSession);
        duplex.on('deleteSession', this.walletService.deleteSession);
        duplex.on('startSession', this.walletService.startSession);

        duplex.on('getState', this.walletService.getState);
        duplex.on('setState', this.walletService.setState);

    },

    bindTabDuplex() {
        duplex.on('tabRequest', async ({ hostname, resolve, data: { action, data, uuid } }) => {
            switch(action) {
                case 'init': {
                    
                    let response = {
                        selectedAddress : "",
                        selectedProvider : ""
                    }

                    if ( this.walletService.getState() >= APP_STATE.WALLET_INITIALIZED ){
                        const currentNetwork = this.walletService.getCurrentNetwork();
                        const account = this.walletService.getCurrentAccount(currentNetwork);
                        response = {
                            selectedAddress : account.data.latestAddress,
                            selectedProvider : currentNetwork.provider
                        }
                    }
                    
                    resolve({
                        success: true,
                        data: response,
                        uuid
                    });
                    break;
                } 

                case 'prepareTransfer': {
                    const currentNetwork = this.walletService.getCurrentNetwork();
                    const account = this.walletService.getCurrentAccount(currentNetwork);
                    const key = this.walletService.getKey();
                    const dseed = Utils.aes256decrypt(account.seed, key);
                    
                    this.walletService.setState(APP_STATE.WALLET_TRANSFERS_IN_QUEUE);
                    this.walletService.openPopup();
                    
                    break;
                }
            }
        });
    },


    bindWalletEvents() {
        /*this.walletService.on('newState', appState => (
            BackgroundAPI.setState(appState)
        ));*/

    }
};

backgroundScript.run();