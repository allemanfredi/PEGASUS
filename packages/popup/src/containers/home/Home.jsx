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
        this.onChangeName = this.onChangeName.bind(this);
        this.onDeleteAccount = this.onDeleteAccount.bind(this);
        this.onReload = this.onReload.bind(this);

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
        };
    } 


    async onReload() {
        PopupAPI.reloadAccountData();
    }

    async onSwitchAccount(account) {
        PopupAPI.setCurrentAccount(account, this.props.network);
    }

    async onChangeName(newName) {
        PopupAPI.updateNameAccount(this.props.account, this.props.network, newName);
    }

    async onDeleteAccount() {
       //TODO
    }

    onClickSend() {
        this.setState({ showSend: true });
        this.setState({ showHome: false });
    }

    onClickReceive() {
        this.setState({ showReceive: true });
        this.setState({ showHome: false });
    }

    onBack() {
        this.setState({ showSend: false });
        this.setState({ showReceive: false });
        this.setState({ showDetails: false });
        this.setState({ showAdd: false });
        this.setState({ showHome: true });
    }

    onClickSettings() { this.setState({ showSettings: true }); }
    onCloseSettings() { this.setState({ showSettings: false }); }

    onAddAccount() {
        this.setState({ showAdd: true });
        this.setState({ showHome: false });
        this.setState({ showSettings: false });
    }


    onLogout() {this.props.onLogout();}

    render() {
        return (
            <div>
                <Navbar showBtnSettings={this.state.showHome}
                        showBtnEllipse={this.state.showHome}
                        showBtnBack={!this.state.showHome}
                        text={this.state.showHome ? this.props.account.name : (this.state.showSend ? 'Send' : (this.state.showReceive ? 'Receive' : this.state.showAdd ? 'Add account' : ''))}
                        onClickSettings={this.onClickSettings}
                        onClickMap={this.onClickMap}
                        onBack={this.onBack}>
                </Navbar>

                { !(Object.keys(this.props.account).length === 0 && this.props.account.constructor === Object) ? ( //!
                    <div>
                        { this.state.showSettings ? ( <Settings network={this.props.network}
                                                                account={this.props.account}
                                                                onAddAccount={this.onAddAccount}
                                                                onSwitchAccount={this.onSwitchAccount}
                                                                onChangeName={this.onChangeName}
                                                                onShowMap={this.onClickMap}
                                                                onLogout={this.onLogout}
                                                                onClose={this.onCloseSettings}/> ) : ''}

                        { this.state.showSend ? (       <Send   account={this.props.account} 
                                                                network={this.props.network}
                                                                onAskConfirm={ () => this.props.onAskConfirm()} /> ) : ''}
                        { this.state.showReceive ? (    <Receive account={this.props.account} network={this.state.network} /> ) : '' }
                        { this.state.showAdd ? (        <Add network={this.props.network} onBack={this.onBack}/>) : ''}


                        { this.state.showHome ? (
                            <div>
                                <div className='row mt-2'>
                                    <div className='col-12 text-center'>
                                        <img src='./material/logo/iota-logo.png' height='60' width='60' alt='iota logo'/>
                                    </div>
                                </div>

                                <div className="row mt-1">
                                    <div className='col-12 text-center text-black text-md'>
                                        { Utils.iotaReducer(this.props.account.data.balance) }
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
                                                account={this.props.account}
                                                network={this.props.network}
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