import React, { Component } from 'react';

import Home from '../home/Home';
import Login from '../login/Login';
import Init from '../init/Init';
import Restore from '../restore/Restore';
import Confirm from '../confirm/Confirm';

import { PopupAPI } from '@pegasus/lib/api';
import {APP_STATE} from '@pegasus/lib/states';


class Main extends Component {
    constructor(props, context) {
        super(props, context);

        this.onSuccessFromInit = this.onSuccessFromInit.bind(this);
        this.onSuccessFromLogin = this.onSuccessFromLogin.bind(this);
        this.onSuccessFromRestore = this.onSuccessFromRestore.bind(this);
        this.onLogout = this.onLogout.bind(this);
        this.onRestore = this.onRestore.bind(this);
        this.onBack = this.onBack.bind(this);   
        this.onRejectAll = this.onRejectAll.bind(this);
        this.onAskConfirm = this.onAskConfirm.bind(this);
        this.onNotConfirms = this.onNotConfirms.bind(this);

        this.home = React.createRef();
        this.confirm = React.createRef();

        this.state = {
            network: {},
            appState : APP_STATE.WALLET_WITHOUT_STATE
        };
    }

    async componentDidMount() {

        await PopupAPI.checkSession();
        const state = await PopupAPI.getState();

        if ( state >= APP_STATE.WALLET_LOCKED  ){
            const network = await PopupAPI.getCurrentNetwork();
            this.setState({ network });
            this.props.showHeader(true);
        }
        if ( state == APP_STATE.WALLET_TRANSFERS_IN_QUEUE )
            this.props.showHeader(false);
        
        this.setState({appState:state});
    }

    async onSuccessFromLogin() {
        PopupAPI.startSession();
        const payments = await PopupAPI.getPayments();
        if ( payments.length > 0 ){
            this.props.showHeader(false);
            this.setState({appState:APP_STATE.WALLET_TRANSFERS_IN_QUEUE});
            PopupAPI.setState(APP_STATE.WALLET_TRANSFERS_IN_QUEUE);
            this.changePayments(payments);
            return;
        }
        this.props.showHeader(true);
        this.setState({appState:APP_STATE.WALLET_UNLOCKED});
        PopupAPI.setState(APP_STATE.WALLET_UNLOCKED);
    }

    onSuccessFromInit() {
        this.props.showHeader(true);
        PopupAPI.startSession();
        this.setState({appState:APP_STATE.WALLET_UNLOCKED});
        PopupAPI.setState(APP_STATE.WALLET_UNLOCKED);
    }

    onSuccessFromRestore() {
        this.props.showHeader(true);
        PopupAPI.startSession();
        this.setState({appState:APP_STATE.WALLET_UNLOCKED});
        PopupAPI.setState(APP_STATE.WALLET_UNLOCKED);
    }

    onLogout() {
        PopupAPI.deleteSession();
        this.props.showHeader(true);
        this.setState({appState:APP_STATE.WALLET_LOCKED});
        PopupAPI.setState(APP_STATE.WALLET_LOCKED);
    }

    onRestore() {
        this.props.showHeader(true);
        this.setState({appState:APP_STATE.WALLET_RESTORE});
        PopupAPI.setState(APP_STATE.WALLET_RESTORE);
    }

    onBack() {
        this.setState({appState:APP_STATE.WALLET_LOCKED});
        PopupAPI.setState(APP_STATE.WALLET_LOCKED);
    }

    onRejectAll(){
        this.props.showHeader(true);
        this.setState({appState:APP_STATE.WALLET_UNLOCKED});
        PopupAPI.rejectAllPayments();
    }
    onNotConfirms(){
        this.props.showHeader(true);
        this.setState({appState:APP_STATE.WALLET_UNLOCKED});
    }

    //called by App.js component in order to reload-data
    changeNetwork(network) {
        this.home.current.changeNetwork(network);
        this.setState({ network });
    }

    //duplex function
    changePayments(payments){
        this.confirm.current.changePayments(payments);
    }
    setConfirmationLoading(isLoading){
        this.confirm.current.setConfirmationLoading(isLoading);
    }
    setConfirmationError(error){
        this.confirm.current.setConfirmationError(error);
    }

    onAskConfirm(){
        this.props.showHeader(false);
        this.setState({appState:APP_STATE.WALLET_TRANSFERS_IN_QUEUE});
        PopupAPI.setState(APP_STATE.WALLET_TRANSFERS_IN_QUEUE);
    }

    render() {
                 
        switch(parseInt(this.state.appState)){
            case APP_STATE.WALLET_NOT_INITIALIZED:
                return <Init onSuccess={this.onSuccessFromInit}/>;
            case APP_STATE.WALLET_LOCKED:
                return <Login onSuccess={this.onSuccessFromLogin} onRestore={this.onRestore}/>
            case APP_STATE.WALLET_RESTORE:
                return <Restore network={this.state.network} onSuccess={this.onSuccessFromRestore} onBack={this.onBack}/>;
            case APP_STATE.WALLET_UNLOCKED:
                return <Home ref={this.home} onLogout={this.onLogout} onAskConfirm={this.onAskConfirm}/>
            case APP_STATE.WALLET_TRANSFERS_IN_QUEUE:
                return <Confirm ref={this.confirm} onNotConfirms={this.onNotConfirms} onRejectAll={this.onRejectAll}/>
            default:
                return '';
        }
 
    }
}

export default Main;