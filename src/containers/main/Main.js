import React, { Component } from 'react';

import { isWalletSetup,getCurrentNewtwork} from '../../wallet/wallet';
import {checkSession,deleteSession,startSession} from '../../utils/utils';

import Home from '../home/Home';
import Login from '../login/Login';
import Init from '../init/Init';
import Restore from '../restore/Restore'

import './Main.css';

class Main extends Component {

  constructor(props,context) {
    super(props,context);

    this.onSuccessFromInit = this.onSuccessFromInit.bind(this);
    this.onSuccessFromLogin = this.onSuccessFromLogin.bind(this);
    this.onSuccessFromRestore = this.onSuccessFromRestore.bind(this);
    this.onLogout = this.onLogout.bind(this);
    this.onRestore = this.onRestore.bind(this);
    this.onBack = this.onBack.bind(this);

    this.home = React.createRef();

    this.state = {
      network : {},
      showLogin : false,
      showInit : false,
      showHome : false,
      showRestore : false
    }
  }

  async componentDidMount(){
    const network = await getCurrentNewtwork();
    this.setState({network : network});

    if ( isWalletSetup() ){
      if (checkSession() ) {
        startSession();
        this.setState({showHome:true});
        this.props.showHeader(true);
      }
      else {
        this.props.showHeader(true);
        this.setState({showLogin:true});
      }
    }
    else {
      this.setState({showInit:true});
    }
  }

  onSuccessFromLogin(){
    this.props.showHeader(true);
    startSession();
    this.setState({showHome:true});
    this.setState({showLogin:false});
  }
  onSuccessFromInit(){
    this.props.showHeader(true);
    startSession();
    this.setState({showHome:true});
    this.setState({showInit:false});
  }
  onSuccessFromRestore(){
    this.props.showHeader(true);
    startSession();
    this.setState({showHome:true});
    this.setState({showRestore:false});
  }

  onLogout(){
    deleteSession();
    this.props.showHeader(true);
    this.setState({showHome:false});
    this.setState({showLogin:true});
  }

  onRestore(){
    this.props.showHeader(true);
    this.setState({showLogin:false});
    this.setState({showRestore:true});
  }

  onBack(){
    this.setState({showRestore:false});
    this.setState({showLogin:true});
  }

  //called by App.js component in order to reload-data
  changeNetwork(network){
    this.home.current.changeNetwork(network);
    this.setState({network : network});
  }

  render() {

    return (
      <main class="main" >
        { this.state.showHome ?     <Home ref={this.home} onLogout={this.onLogout}> </Home> : '' }
        { this.state.showInit ?     <Init onSuccess={this.onSuccessFromInit}> </Init> : '' }
        { this.state.showLogin ?    <Login onSuccess={this.onSuccessFromLogin} onRestore={this.onRestore}> </Login> : '' }
        { this.state.showRestore ?  <Restore network={this.state.network} onSuccess={this.onSuccessFromRestore} onBack={this.onBack}> </Restore> : '' }
      </main>
    );
  }

}

export default Main;