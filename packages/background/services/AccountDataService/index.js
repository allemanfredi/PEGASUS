import IOTA from '@pegasus/lib/iota'

const AccountDataService = {

  async retrieveAccountData(seed, provider) {
    IOTA.setProvider(provider)
    const newData = await IOTA.getAccountData(seed);
    const transactions = this.mapTransactions(newData);
    return { transactions, newData };
  },

  mapTransactions(data) {
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

      //remove double bundle
      const app = doubleBundle.filter(bundle => bundle === obj.bundle);
      if (app.length === 0) {
        transactions.push(obj);
        doubleBundle.push(obj.bundle);
      }
    });
    return transactions;
  }

}

export default AccountDataService;



//bundle explanation : //https://domschiener.gitbooks.io/iota-guide/content/chapter1/bundles.html
