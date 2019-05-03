export default {
    currentAddress: false,

    init(duplex) {
        this.duplex = duplex;
    },

    setPayments(payments) {
        this.duplex.send('popup', 'setPayments', payments, false);
    },

    setConfirmationLoading(isLoading) {
        this.duplex.send('popup', 'setConfirmationLoading', isLoading, false);
    },

};