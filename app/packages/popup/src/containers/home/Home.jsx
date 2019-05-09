import React, { Component } from 'react';

import Send from '../send/Send';
import Receive from '../receive/Receive';
import Settings from '../settings/Settings';
import Transactions from '../transactions/Transactions';
import Add from '../add/Add';

import Loader from '../../components/loader/Loader';
import Navbar from '../../components/navbar/Navbar';

import { PopupAPI } from '@pegasus/lib/api';
import Utils from '@pegasus/lib/utils';
import IOTA from '@pegasus/lib/iota';


class Home extends Component {
    constructor(props, context) {
        super(props, context);

        //transactions components
        this.transactions = React.createRef();

        this.onClickSend = this.onClickSend.bind(this);
        this.onClickSettings = this.onClickSettings.bind(this);
        this.onCloseSettings = this.onCloseSettings.bind(this);
        this.onClickReceive = this.onClickReceive.bind(this);
        this.onBack = this.onBack.bind(this);
        this.onSwitchAccount = this.onSwitchAccount.bind(this);
        this.onAddAccount = this.onAddAccount.bind(this);
        this.onLogout = this.onLogout.bind(this);
        this.onChangeAccount = this.onChangeAccount.bind(this);
        this.onChangeName = this.onChangeName.bind(this);
        this.onDeleteAccount = this.onDeleteAccount.bind(this);
        this.onReload = this.onReload.bind(this);
        this.changeNetwork = this.changeNetwork.bind(this);

        this.state = {
            error: '',
            account: {},
            network: {},
            details: {}, //transaction selected from the table
            decryptedSeed: '',
            isLoading: false,
            showSend: false,
            showHome: true,
            showReceive: false,
            showSettings: false,
            showAdd: false,
            interval: {},
        };
    }

    async componentDidMount() {
        try{
            const network = await PopupAPI.getCurrentNetwork();
            this.setState({ network });
            const account = await PopupAPI.getCurrentAccount(network);
            const key = await PopupAPI.getKey();
            const dseed = Utils.aes256decrypt(account.seed, key);
            this.setState({ decryptedSeed: dseed });

            //check account data after 40 seconds in order to receive the transaction
            this.getData();
            this.setState( state => {
                const interval = setInterval(() => this.getData(), 40000);
                return{
                    interval
                };
            });

            this.setState({ account });
        }catch(err) {
            this.setState({ error: err.error });
            console.log(err);
        }
    }

    async changeNetwork(network) {
        const currentName = this.state.account.name;
        this.setState({ account: {} });
        this.setState({ network });

        let account = await PopupAPI.getCurrentAccount(network);
        if (Object.entries(account.data).length === 0 && account.data.constructor === Object ) { //can happens only for the first switch when the wallet is generated on the mainnet and the user switch to the testnet
            const key = await PopupAPI.getKey();
            const dseed = Utils.aes256decrypt(account.seed, key);

            this.setState({ decryptedSeed: dseed });
            account.data = await IOTA.getAccountData(dseed);
            PopupAPI.updateDataAccount(account.data,network);
        }

        //store the encrypted seed
        const key = await PopupAPI.getKey();
        const dseed = Utils.aes256decrypt(account.seed, key);
        this.setState({ decryptedSeed: dseed });

        this.setState({ account });

        if ( this.state.showHome )
            this.transactions.current.updateData();
    }

    async getData() {
        IOTA.getAccountData(this.state.decryptedSeed)
        .then( async data => {
            //update table
            const newAccount = await PopupAPI.updateDataAccount(data, this.state.network);
            this.setState({ account: newAccount });
            if ( this.state.showHome && !this.state.showSettings )
                this.transactions.current.updateData();
        }) 
    }

    async onReload() {
        this.setState({ account: {} });
        this.getData();
    }

    async onSwitchAccount(account) {
        this.setState({ account });
        this.transactions.current.updateData();

        //store the encrypted seed
        const key = await PopupAPI.getKey();
        const dseed = Utils.aes256decrypt(account.seed, key);
        this.setState({ decryptedSeed: dseed });

        await PopupAPI.setCurrentAccount(account, this.state.network);
    }

    async onChangeName(newName) {
        //change the name of the current account
        const updateAccount = await PopupAPI.updateNameAccount(this.state.account, this.state.network, newName);
        this.setState({account:updateAccount});
    }

    async onDeleteAccount() {
        const newAccount = await PopupAPI.getCurrentAccount(this.state.network);
        this.setState({ account: newAccount });

        this.transactions.current.updateData();
        this.setState({ showSettings: false });
    }

    onClickSend() {
        clearInterval(this.state.interval);
        this.setState({ showSend: true });
        this.setState({ showHome: false });
    }

    onClickReceive() {
        clearInterval(this.state.interval);
        this.setState({ showReceive: true });
        this.setState({ showHome: false });
    }

    onBack() {
        this.setState( state => {
            const interval = setInterval(() => this.getData(), 60000);
            return{
                interval
            };
        });

        this.setState({ showSend: false });
        this.setState({ showReceive: false });
        this.setState({ showDetails: false });
        this.setState({ showAdd: false });
        this.setState({ showHome: true });
    }

    onClickSettings() { this.setState({ showSettings: true }); }
    onCloseSettings() { this.setState({ showSettings: false }); }

    onAddAccount() {
        clearInterval(this.state.interval);
        this.setState({ showAdd: true });
        this.setState({ showHome: false });
        this.setState({ showSettings: false });
    }

    async onChangeAccount(account) {
        this.setState({ account });
        this.setState({ showHome: true });
        this.setState({ showAdd: false });
        this.transactions.current.updateData();
    }

    onLogout() {
        clearInterval(this.state.interval);
        this.props.onLogout();
    }


    render() {
        return (
            <div>
                <Navbar showBtnSettings={this.state.showHome}
                        showBtnMarker={this.state.showHome}
                        showBtnBack={!this.state.showHome}
                        text={this.state.showHome ? this.state.account.name : (this.state.showSend ? 'Send' : (this.state.showReceive ? 'Receive' : this.state.showAdd ? 'Add account' : ''))}
                        onClickSettings={this.onClickSettings}
                        onClickMap={this.onClickMap}
                        /*onAccountDetails={this.onAccountDetails}*/
                        onBack={this.onBack}>
                </Navbar>

                { !(Object.keys(this.state.account).length === 0 && this.state.account.constructor === Object) ? ( //!
                    <div>
                        { this.state.showSettings ? ( <Settings currentNetwork={this.state.network}
                                                                currentAccount={this.state.account}
                                                                onAddAccount={this.onAddAccount}
                                                                onSwitchAccount={this.onSwitchAccount}
                                                                onChangeName={this.onChangeName}
                                                                onShowMap={this.onClickMap}
                                                                onLogout={this.onLogout}
                                                                onClose={this.onCloseSettings}/> ) : ''}

                        { this.state.showSend ? (       <Send   account={this.state.account} 
                                                                network={this.state.network}
                                                                onAskConfirm={ () => this.props.onAskConfirm()} /> ) : ''}
                        { this.state.showReceive ? (    <Receive account={this.state.account} network={this.state.network} /> ) : '' }
                        { this.state.showAdd ? (        <Add network={this.state.network} onChangeAccount={this.onChangeAccount}/>) : ''}


                        { this.state.showHome ? (
                            <div>
                                <div className='row mt-2'>
                                    <div className='col-12 text-center'>
                                        <img src='./material/logo/iota-logo.png' height='60' width='60' alt='iota logo'/>
                                    </div>
                                </div>

                                <div className="row mt-1">
                                    <div className='col-12 text-center text-black text-md'>
                                        { Utils.iotaReducer(this.state.account.data.balance) }
                                    </div>
                                </div>

                                <div className='row mt-1 mb-2'>
                                    <div className="col-2"></div>
                                    <div className='col-4 text-center'>
                                        <button onClick={this.onClickReceive} className='btn btn-border-blue btn-big'>Receive</button>
                                    </div>
                                    <div className='col-4 text-center'>
                                        <button onClick={this.onClickSend} className='btn btn-border-blue btn-big'>Send</button>
                                    </div>
                                    <div className="col-2"></div>
                                </div>

                                <Transactions   ref={this.transactions}
                                                transfers={this.state.account.data.transfers}
                                                network={this.state.network}
                                                onReload={this.onReload}
                                />  
                            </div>
                        ) : '' }

                    </div> ) : (
                    <Loader/>
                )}
            </div>
        );
    }
}

export default Home;