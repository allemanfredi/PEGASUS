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
    }

};