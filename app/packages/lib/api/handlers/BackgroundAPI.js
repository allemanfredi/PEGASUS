export default {
    currentAddress: false,

    init(duplex) {
        this.duplex = duplex;
    },

    setAddress(address) {
        this.duplex.send('popup', 'setAddress', address, false);

        if(this.currentAddress === account)
            return;

        this.currentAddress = address;
    },

    setProvider(provider) {
        this.duplex.send('tab', 'tunnel', {
            action: 'setProvider',
            data: provider
        }, false);
    },

};