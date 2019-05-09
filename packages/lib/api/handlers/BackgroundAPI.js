export default {

    init(duplex) {
        this.duplex = duplex;
    },

    setPayments(payments) {
        this.duplex.send('popup', 'setPayments', payments, false);
    },

    setConfirmationLoading(isLoading) {
        this.duplex.send('popup', 'setConfirmationLoading', isLoading, false);
    },

    setConfirmationError(error){
        this.duplex.send('popup', 'setConfirmationError', error , false);
    },

    setAddress(address){
        this.duplex.send('tab', 'tunnel', {
            action: 'setAddress',
            data: address
        }, false);
    },

    setProvider(provider){
        this.duplex.send('tab', 'tunnel', {
            action: 'setProvider',
            data: provider
        }, false);
    }


};