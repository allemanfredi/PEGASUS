import React, { Component } from 'react';

import { isWalletSetup } from '../../wallet/wallet';
import {checkSession,deleteSession,startSession} from '../../utils/utils';

import Home from '../home/Home';
import Login from '../login/Login';
import Init from '../init/Init';
import Restore from '../restore/Restore'

import './Main.css';

class Main extends Component {

  constructor(props,context) {
    super(props,context);

    this.onSuccess = this.onSuccess.bind(this);
    this.onLogout = this.onLogout.bind(this);
    this.onRestore = this.onRestore.bind(this);

    this.state = {
      network : {},
      showLogin : false,
      showInit : false,
      showHome : false,
      showRestore : false
    }
  }

  componentDidMount(){
    if ( isWalletSetup() ){
      if (checkSession() ) {
        startSession();
        this.setState({showHome:true});
        this.props.showHeader(true);
      }
      else {
        this.setState({showLogin:true});
      }
    }
    else {
      this.setState({showInit:true});
    }
  }

  onSuccess(){
    this.props.showHeader(true);
    this.setState({showHome:true});
    this.setState({showLogin:false});
    this.setState({showInit:false});
  }

  onLogout(){
    deleteSession();
    this.props.showHeader(false);
    this.setState({showHome:false});
    this.setState({showLogin:true});
  }

  onRestore(){
    this.setState({showLogin:false});
    this.setState({showRestore:true});
  }

  //called by App.js component in order to reload-data
  changeNetwork(network){
    this.setState({network : network});
  }

  render() {

    return (
      <main class="main" >
        { this.state.showHome ?     <Home network={this.state.network} onLogout={this.onLogout}> </Home> : '' }
        { this.state.showInit ?     <Init onSuccess={this.onSuccess}> </Init> : '' }
        { this.state.showLogin ?    <Login onSuccess={this.onSuccess} onRestore={this.onRestore}> </Login> : '' }
        { this.state.showRestore ?  <Restore onSuccess={this.onSuccess}> </Restore> : '' }
      </main>
    );
  }

}

export default Main;