import React, { Component } from 'react';
import Home from '../home/Home';
import Login from '../login/Login';
import Init from '../init/Init';
import Restore from '../restore/Restore';
import Confirm from '../confirm/Confirm';
import MessageDuplex from '@pegasus/lib/MessageDuplex';
import { PopupAPI } from '@pegasus/lib/api';
import { APP_STATE } from '@pegasus/lib/states';


class Main extends Component {
  constructor(props, context) {
    super(props, context);

    this.bindDuplexRequests = this.bindDuplexRequests.bind(this);
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
      appState: APP_STATE.WALLET_WITHOUT_STATE,
      duplex: new MessageDuplex.Popup(),
    };
  }

  async componentDidMount() {

    await PopupAPI.checkSession();
    let state = await PopupAPI.getState();

    if (state >= APP_STATE.WALLET_LOCKED) {
      this.props.showHeader(true);
    }

    if (state >= APP_STATE.WALLET_UNLOCKED) {
      PopupAPI.startHandleAccountData();
    }

    //payment queue not empty during an extension hard reload cause show confirm view with 0 payment since the payments are deleted during the hard rel
    /*const payments = await PopupAPI.getPayments();
    if ( state == APP_STATE.WALLET_TRANSFERS_IN_QUEUE && payments.length === 0 ){
        state = APP_STATE.WALLET_LOCKED;
        PopupAPI.setState(APP_STATE.WALLET_LOCKED);
    }*/

    if (state === APP_STATE.WALLET_TRANSFERS_IN_QUEUE)
      this.props.showHeader(false);

    this.setState({ appState: state });
    this.bindDuplexRequests();
  }

  bindDuplexRequests() {
    this.state.duplex.on('setAppState', appState => {
      this.setState({ appState });
      if (appState > APP_STATE.WALLET_LOCKED)
        this.props.showHeader(true);
      else this.props.showHeader(false);
    });
  }

  async onSuccessFromLogin() {
    PopupAPI.startSession();
    PopupAPI.setState(APP_STATE.WALLET_UNLOCKED);

    const payments = await PopupAPI.getPayments();
    if (payments.length > 0) {
      this.props.showHeader(false);
      this.setState({ appState: APP_STATE.WALLET_TRANSFERS_IN_QUEUE });
      PopupAPI.setState(APP_STATE.WALLET_TRANSFERS_IN_QUEUE);
      this.changePayments(payments);
      return;
    } else {
      PopupAPI.closePopup();

      //enable all requets from injections exept payments
      PopupAPI.executeRequests();
    }

    PopupAPI.startHandleAccountData();
    this.props.showHeader(true);
    this.setState({ appState: APP_STATE.WALLET_UNLOCKED });
  }

  onSuccessFromInit() {
    this.props.showHeader(true);
    this.setState({ appState: APP_STATE.WALLET_UNLOCKED });
    PopupAPI.startHandleAccountData();
    PopupAPI.setState(APP_STATE.WALLET_UNLOCKED);
    PopupAPI.startSession();
  }

  onSuccessFromRestore() {
    this.props.showHeader(true);
    this.setState({ appState: APP_STATE.WALLET_UNLOCKED });
    PopupAPI.setState(APP_STATE.WALLET_UNLOCKED);
    PopupAPI.startHandleAccountData();
    PopupAPI.startSession();
  }

  onLogout() {
    PopupAPI.deleteSession();
    PopupAPI.stopHandleAccountData();
    this.props.showHeader(true);
    this.setState({ appState: APP_STATE.WALLET_LOCKED });
    PopupAPI.setState(APP_STATE.WALLET_LOCKED);
  }

  onRestore() {
    this.props.showHeader(true);
    this.setState({ appState: APP_STATE.WALLET_RESTORE });
    PopupAPI.setState(APP_STATE.WALLET_RESTORE);
  }

  onBack() {
    this.setState({ appState: APP_STATE.WALLET_LOCKED });
    PopupAPI.setState(APP_STATE.WALLET_LOCKED);
  }

  onRejectAll() {
    this.props.showHeader(true);
    this.setState({ appState: APP_STATE.WALLET_UNLOCKED });
    PopupAPI.rejectAllPayments();
  }

  onNotConfirms() {
    this.props.showHeader(true);
    this.setState({ appState: APP_STATE.WALLET_UNLOCKED });
  }

  //duplex function
  changePayments(payments) {
    this.confirm.current.changePayments(payments);
  }

  setConfirmationLoading(isLoading) {
    this.confirm.current.setConfirmationLoading(isLoading);
  }

  setConfirmationError(error) {
    this.confirm.current.setConfirmationError(error);
  }

  onAskConfirm() {
    this.props.showHeader(false);
    this.setState({ appState: APP_STATE.WALLET_TRANSFERS_IN_QUEUE });
    PopupAPI.setState(APP_STATE.WALLET_TRANSFERS_IN_QUEUE);
  }

  //add network
  addCustomNetwork() {
    this.home.current.addCustomNetwork();
  }

  render() {
    console.log(this.state.appState)
    switch (this.state.appState) {
      case APP_STATE.WALLET_NOT_INITIALIZED:
        return <Init onSuccess={this.onSuccessFromInit} />;
      case APP_STATE.WALLET_LOCKED:
        return <Login onSuccess={this.onSuccessFromLogin} onRestore={this.onRestore} />
      case APP_STATE.WALLET_RESTORE:
        return <Restore network={this.props.network} onSuccess={this.onSuccessFromRestore} onBack={this.onBack} />;
      case APP_STATE.WALLET_UNLOCKED:
        return <Home ref={this.home} account={this.props.account} network={this.props.network} onLogout={this.onLogout} onAskConfirm={this.onAskConfirm} />
      case APP_STATE.WALLET_TRANSFERS_IN_QUEUE:
        return <Confirm ref={this.confirm} onNotConfirms={this.onNotConfirms} onRejectAll={this.onRejectAll} />
      default:
        return '';
    }
  }
}

export default Main;