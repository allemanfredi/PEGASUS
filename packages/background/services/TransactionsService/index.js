import EventEmitter from 'eventemitter3';
import extensionizer from 'extensionizer';
import Utils from '@pegasus/lib/utils';

import { BackgroundAPI } from '@pegasus/lib/api';
import IOTA from '@pegasus/lib/iota'

class Transactions extends EventEmitter {
    constructor(){
        super();

        this.setInterval ( this.retrieveTransactions , 60000 );
    }

    retrieveTransactions(){

        const arr = [];
        const doubleBundle = [];
        const currentTransactions = this.state.transactions;
        this.props.transfers.forEach(transfer => {
            //da gestire le meta tx

            if (transfer.length === 0)
                return;

            let value;
            if (transfer[0].value < 0) { //RECEIVED
                value = -(transfer[0].value + transfer[3].value);
            } else { //SENT
                value = -transfer[0].value;
            }

            //in order to keep open the opened card after data refreshing
            const txApp = currentTransactions.filter( tx => tx.bundle === transfer[0].bundle);
            let showDetails = false;
            if ( txApp.length === 1 ){
                if ( txApp[0].showDetails )
                    showDetails = true;
            }
            

            const obj = {
                timestamp: transfer[0].attachmentTimestamp,
                value,
                status: transfer[0].persistence,
                bundle: transfer[0].bundle,
                index: transfer[0].currentIndex,
                showDetails, 
                transfer
            };

            //remove double bundle (reattachemen txs)
            //arr = arr.filter ( item => item.bundle != obj.bundle );
            //in questo modo prendo la prima transazione con stesso bundle
            //cosi da escludere le reattachment transaction
            let add = true;
            for (const tx of doubleBundle) {
                if (tx.bundle === obj.bundle)
                    add = false;
            }
            if (add) {
                arr.push(obj);
                doubleBundle.push(obj);
            }
        });
    }

}



//bundle explanation : //https://domschiener.gitbooks.io/iota-guide/content/chapter1/bundles.html
