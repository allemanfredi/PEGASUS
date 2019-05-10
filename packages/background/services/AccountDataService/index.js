import IOTA from '@pegasus/lib/iota'

const AccountDataService = {

    async retrieveAccountData(seed,provider){

        IOTA.setProvider(provider)
        const newData = await IOTA.getAccountData(seed);
        const transactions = this.mapTransactions(newData);
        return {transactions , newData};
    },

    mapTransactions(data){
        const transactions = [];
        const doubleBundle = [];
        data.transfers.forEach(transfer => {
            
            if (transfer.length === 0)  
                return;

            let value;
            transfer[0].value < 0 ? value = -(transfer[0].value + transfer[3].value) : value = -transfer[0].value;

            const obj = {
                timestamp: transfer[0].attachmentTimestamp,
                value,
                status: transfer[0].persistence,
                bundle: transfer[0].bundle,
                index: transfer[0].currentIndex,
                transfer
            };

            //remove double bundle (reattachemen txs)
            //transactions = transactions.filter ( item => item.bundle != obj.bundle );
            //in questo modo prendo la prima transazione con stesso bundle
            //cosi da escludere le reattachment transaction
            let add = true;
            for (const tx of doubleBundle) {
                if (tx.bundle === obj.bundle)
                    add = false;
            }
            if (add) {
                transactions.push(obj);
                doubleBundle.push(obj);
            }
        });
        return transactions;
    }

}

export default AccountDataService;



//bundle explanation : //https://domschiener.gitbooks.io/iota-guide/content/chapter1/bundles.html
