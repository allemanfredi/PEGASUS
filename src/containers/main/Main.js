import React, { Component } from 'react';

import { isWalletSetup } from '../../wallet/wallet';
import {checkSession} from '../../utils/utils';
import  Routes from '../../routes/Routes'
import history from '../../components/history';

import './Main.css';

class Main extends Component {

  constructor(props,context) {
    super(props,context);

    this.state = {
      childProps : {}
    }
  }

  componentDidMount(){
    if ( isWalletSetup() ){
      if (checkSession() ) {
        history.push("/home");
        this.props.showHeader(true);
      }
      else history.push("/login");
    }
    else history.push('/init');
  }

  //called by App.js component in order to reload-data
  changeNetwork(network){
    this.setState({childProps : network});
  }

  render() {

    return (
      <main class="main" >
        <Routes childProps={this.state.childProps} />
      </main>
    );
  }

}

export default Main;