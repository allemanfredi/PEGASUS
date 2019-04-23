import MessageDuplex from '@pegasus/lib/MessageDuplex';
import WalletService from './services/WalletService';
import Utils from '@pegasus/lib/utils';

import { BackgroundAPI } from '@pegasus/lib/api';

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
        duplex.on('getCurrentNewtwork', this.walletService.getCurrentNewtwork);
        
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
    },

    bindTabDuplex() {
        duplex.on('tabRequest', async ({ hostname, resolve, data: { action, data, uuid } }) => {
            switch(action) {
                case 'init': {
                    
                    let response = {
                        selectedAddress : "",
                        provider : ""
                    }

                    if ( this.walletService.isWalletSetup() ){
                        response = {
                            address : this.walletService.getCurrentAccount().data.latestAddress,
                            provider : this.walletService.getCurrentNewtwork()
                        }
                    }
                    
                    resolve({
                        success: true,
                        data: response,
                        uuid
                    });
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