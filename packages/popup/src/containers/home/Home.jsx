import React, { Component } from 'react';

import Send from '../send/Send';
import Receive from '../receive/Receive';
import Settings from '../settings/Settings';
import Transactions from '../transactions/Transactions';
import Add from '../add/Add';
import Network from '../network/Network';

import Loader from '../../components/loader/Loader';
import Navbar from '../../components/navbar/Navbar';
import Alert from '../../components/alert/Alert';


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
        this.onConfirm = this.onConfirm.bind(this);
        this.onViewAccountOnExplorer = this.onViewAccountOnExplorer.bind(this);
        this.onExportSeed = this.onExportSeed.bind(this);
        this.onAddNetwork = this.onAddNetwork.bind(this);

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
            showNetwork : false,
            showAdd: false,
            showAlert : false,
            alertType : '',
            alertText : '',
            actionToConfirm : ''
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
        this.setState(() => {
            return {
                showAlert:true,
                alertText:'Are you sure you want delete this account?',
                alertType:'confirm',
                actionToConfirm:'deleteAccount'
            }

        })
    }

    onViewAccountOnExplorer(){
        //TODO
    }

    onExportSeed(){
        //TODO
    }

    async onConfirm(){
        switch(this.state.actionToConfirm){
            case 'deleteAccount' :{
                const account = await PopupAPI.deleteAccount(this.props.account,this.props.account.network);
                if ( !account  ){
                    this.setState( () => {
                        return {
                            showAlert:true,
                            alertText:'Impossible to delete this account',
                            alertType:'error'
                        }
                    })
                }else this.setState({showAlert:false});

                break;
            }
        } 

    }

    onClickSend() {
        this.setState( () => {
            return{
                showSend : true,
                showHome : false
            }
        })
    }

    onClickReceive() {
        this.setState( () => {
            return{
                showReceive : true,
                showHome : false
            }
        })
    }

    onBack() {
        this.setState( () => {
            return {
                showSend : false,
                showReceive : false,
                showDetails : false,
                showAlert : false,
                showAdd : false,
                showNetwork : false,
                showHome : true
            }
        })
    }

    onClickSettings() { this.setState({ showSettings: true }); }
    onCloseSettings() { this.setState({ showSettings: false }); }

    onAddAccount() {
        this.setState( () => {
            return {
                showAdd : true,
                showHome : false,
                showSettings : false
            }
        });
    }
    onLogout() {this.props.onLogout();}

    addCustomNetwork(){
        this.setState( () => {
            return {
                showHome : false,
                showNetwork : true
            }
        });
    }

    async onAddNetwork(network){
        this.setState( () => {
            return{
                showNetwork:false,
                showHome:true
            }
        });
        await PopupAPI.addNetwork(network);
        await PopupAPI.setCurrentNetwork(network);
        await PopupAPI.getCurrentAccount(network);
    }

    render() {
        return (
            <div>
                <Navbar account={this.props.account}
                        network={this.props.network}
                        showBtnSettings={this.state.showHome}
                        showBtnEllipse={this.state.showHome}
                        showBtnBack={!this.state.showHome}
                        text={this.state.showHome ? this.props.account.name : (this.state.showSend ? 'Send' : (this.state.showReceive ? 'Receive' : this.state.showAdd ? 'Add account' : ( this.state.showNetwork ? 'Add custom node' : '' )))}
                        onClickSettings={this.onClickSettings}
                        onClickMap={this.onClickMap}
                        onBack={this.onBack}
                        onDeleteAccount={this.onDeleteAccount}
                        onViewAccountOnExplorer={this.onViewAccountOnExplorer}
                        onExportSeed={this.onExportSeed}>
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

                        { this.state.showSend ?       <Send     account={this.props.account} 
                                                                network={this.props.network}
                                                                onAskConfirm={ () => this.props.onAskConfirm()} />  : ''}
                        { this.state.showReceive ?    <Receive account={this.props.account} network={this.state.network} /> : '' }
                        { this.state.showAdd ?        <Add network={this.props.network} onBack={this.onBack}/> : ''}
                        { this.state.showNetwork ?    <Network onAddNetwork={this.onAddNetwork}/> : ''}


                        { this.state.showAlert ? <Alert type={this.state.alertType} 
                                                        text={this.state.alertText}
                                                        onClose={this.onBack}
                                                        onConfirm={this.onConfirm}
                                                        /> : '' }


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