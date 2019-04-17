import React, { Component } from 'react';
import { getAccountData } from '../../core/core';
import { setCurrentAccount, getCurrentAccount, generateSeed, updateDataAccount, addAccount, getKey, getCurrentNewtwork, updateNameAccount } from '../../wallet/wallet';
import { aes256decrypt, aes256encrypt, sha256, generateKeys } from '../../utils/crypto';

import Send from '../send/Send';
import Receive from '../receive/Receive';
import Settings from '../settings/Settings';
import Details from '../details/Details';
import Transactions from '../transactions/Transactions';
import Add from '../add/Add';
import Edit from '../edit/Edit';
import Interact from '../marketplace/interact/Interact';

import Loader from '../../components/loader/Loader';
import Navbar from '../../components/navbar/Navbar';

import './Home.css';

class Home extends Component {
    constructor(props, context) {
        super(props, context);

        //transactions components
        this.transactions = React.createRef();
        this.interact = React.createRef();

        this.onClickSend = this.onClickSend.bind(this);
        this.onClickSettings = this.onClickSettings.bind(this);
        this.onCloseSettings = this.onCloseSettings.bind(this);
        this.onClickReceive = this.onClickReceive.bind(this);
        this.onBack = this.onBack.bind(this);
        this.onSwitchAccount = this.onSwitchAccount.bind(this);
        this.onAddAccount = this.onAddAccount.bind(this);
        this.onGoDetails = this.onGoDetails.bind(this);
        this.onLogout = this.onLogout.bind(this);
        this.onShowEdit = this.onShowEdit.bind(this);
        this.onCloseEdit = this.onCloseEdit.bind(this);
        this.onChangeAccount = this.onChangeAccount.bind(this);
        this.onChangeName = this.onChangeName.bind(this);
        this.onDeleteAccount = this.onDeleteAccount.bind(this);
        this.onClickMap = this.onClickMap.bind(this);
        this.onCloseDetails = this.onCloseDetails.bind(this);
        this.onReload = this.onReload.bind(this);
        this.onClickShowData = this.onClickShowData.bind(this);
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
            showInteract: false,
            showDetails: false,
            showAdd: false,
            showEdit: false,
            interval: {},
        };
    }

    async componentDidMount() {
        try{
            const network = await getCurrentNewtwork();
            this.setState({ network });
            const account = await getCurrentAccount(network);

            const key = await getKey();
            const dseed = aes256decrypt(account.seed, key);
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

        let account = await getCurrentAccount(network);
        if (!account) { //can happens only for the first switch when the wallet is generated on the mainnet and the user switch to the testnet
            account = await this.createAccount(network, `${currentName }-test`);
        }

        //store the encrypted seed
        const key = await getKey();
        const dseed = aes256decrypt(account.seed, key);
        this.setState({ decryptedSeed: dseed });

        this.setState({ account });

        if ( this.state.showHome )
            this.transactions.current.updateData();
    }

    async createAccount (network, name) {
        //generate new seed
        return new Promise( async (resolve, reject) => {
            const newSeed = generateSeed().toString().replace(/,/g, '');
            const key = await getKey();
            const eseed = aes256encrypt(newSeed, key);

            //get all account data
            const data = await getAccountData(newSeed);
            const account = {
                name,
                seed: eseed,
                data,
                id: sha256(name),
                network, //NUOVA NETWORK
                marketplace: { keys: generateKeys(), channels: [] }
            };
            await addAccount(account, network, true);
            resolve(account);
        });
    }

    async getData() {
        const data = await getAccountData(this.state.decryptedSeed);

        //update table
        const newAccount = await updateDataAccount(data, this.state.network);
        this.setState({ account: newAccount });
        if ( this.state.showHome && !this.state.showSettings )
            this.transactions.current.updateData();
    }

    async onReload() {
        this.setState({ account: {} });
        this.getData();
    }

    async onSwitchAccount(account) {
        this.setState({ account });
        this.transactions.current.updateData();

        //store the encrypted seed
        const key = await getKey();
        const dseed = aes256decrypt(account.seed, key);
        this.setState({ decryptedSeed: dseed });

        await setCurrentAccount(account, this.state.network);
    }

    async onChangeName(newName) {
        //change the name of the current account
        await updateNameAccount(this.state.account, this.state.network, newName);
        this.setState(prevState => ({ account: { ...prevState.account, name: newName } }));
        this.setState({ showEdit: false });
    }

    async onDeleteAccount() {
        const newAccount = await getCurrentAccount(this.state.network);
        this.setState({ account: newAccount });

        this.transactions.current.updateData();

        this.setState({ showEdit: false });
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
        this.setState({ showInteract: false });
        this.setState({ showHome: true });
    }

    onClickSettings() { this.setState({ showSettings: true }); }

    onCloseSettings() { this.setState({ showSettings: false }); }

    onGoDetails(transfer) {
        clearInterval(this.state.interval);
        this.setState({ details: transfer });
        this.setState({ showDetails: true });
    }

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

    onShowEdit() { this.setState({ showEdit: true }); }

    onCloseEdit() { this.setState({ showEdit: false }); }

    onClickMap() {
        clearInterval(this.state.interval);
        this.setState({ showHome: false });
        this.setState({ showSettings: false });
        this.setState({ showInteract: true });
    }

    onCloseDetails() { this.setState({ showDetails: false }); }

    onClickShowData() { this.interact.current.showData(); }

    render() {
        return (
            <div>
                <Navbar showBtnSettings={this.state.showHome}
                    showBtnMarker={this.state.showHome}
                    showBtnBack={!this.state.showHome}
                    showBtnData={this.state.showInteract}
                    text={this.state.showHome ? this.state.account.name : (this.state.showSend ? 'Send' : (this.state.showReceive ? 'Receive' : this.state.showAdd ? 'Add account' : (this.state.showInteract ? 'Buy data' : '')))}
                    onClickSettings={this.onClickSettings}
                    onClickMap={this.onClickMap}
                    onClickShowData={this.onClickShowData}
                    onBack={this.onBack}
                >
                </Navbar>

                { !(Object.keys(this.state.account).length === 0 && this.state.account.constructor === Object) ? ( //!
                    <div>
                        { this.state.showSettings ? ( <Settings currentNetwork={this.state.network}
                            currentAccount={this.state.account}
                            onAddAccount={this.onAddAccount}
                            onSwitchAccount={this.onSwitchAccount}
                            onShowMap={this.onClickMap}
                            onShowEdit={this.onShowEdit}
                            onLogout={this.onLogout}
                            onClose={this.onCloseSettings}
                                                      /> )
                            : ''}
                        { this.state.showSend ? ( <Send account={this.state.account} network={this.state.network} /> ) : ''}
                        { this.state.showReceive ? ( <Receive account={this.state.account} network={this.state.network} /> ) : '' }
                        { this.state.showDetails ? ( <Details details={this.state.details}
                            onClose={this.onCloseDetails}
                                                     /> ) : '' }
                        { this.state.showAdd ? ( <Add network={this.state.network} onChangeAccount={this.onChangeAccount}/>) : ''}
                        { this.state.showInteract ? ( <Interact ref={this.interact}
                            network={this.state.network}
                            account={this.state.account}
                                                      />) : ''}

                        { this.state.showEdit ? ( <Edit account={this.state.account}
                            network={this.state.network}
                            onClose={this.onCloseEdit}
                            onChangeName={this.onChangeName}
                            onDeleteAccount={this.onDeleteAccount}
                                                  />) : ''}

                        { this.state.showHome ? (
                            <div>
                                <div className='container-info'>
                                    <div className='row '>
                                        <div className='col align-center'>
                                            <img src='./material/logo/iota-logo.png' height='60' width='60' alt='iota logo'/>
                                            <div className='container-balance'>
                                                { this.state.account.data.balance > 99999999 || this.state.account.data.balance < -99999999 ? `${(this.state.account.data.balance / 1000000000).toFixed(2) } Gi` :
                                                    this.state.account.data.balance > 99999 || this.state.account.data.balance < -99999 ? `${(this.state.account.data.balance / 1000000).toFixed(2) } Mi` :
                                                        this.state.account.data.balance > 999 || this.state.account.data.balance < -999 ? `${(this.state.account.data.balance / 1000).toFixed(2) } Ki` :
                                                            `${this.state.account.data.balance }i` }
                                            </div>
                                        </div>
                                    </div>
                                    <div className='row'>
                                        <div className='col-6 text-center'>
                                            <button onClick={this.onClickSend} className='btn btn-send'><i className='fa fa-paper-plane'></i></button>
                                        </div>
                                        <div className='col-6 text-center'>
                                            <button onClick={this.onClickReceive} className='btn btn-receive'><i className='fa fa-download' ></i></button>
                                        </div>
                                    </div>
                                    <div className='row'>
                                        <div className='col-6 text-center'><div className='text-send'>Send</div></div>
                                        <div className='col-6 text-center'><div className='text-receive'>Receive</div></div>
                                    </div>
                                </div>
                                <div className='container-transactions'>
                                    <Transactions ref={this.transactions}
                                        transfers={this.state.account.data.transfers}
                                        onGoDetails={this.onGoDetails}
                                        onReload={this.onReload}
                                    />
                                </div>
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