import React, { Component } from 'react';
import {iotaInit} from '../core/core';
import Header from './header/Header';
import Main from './main/Main';
import {getCurrentNewtwork,setCurrentNetwork} from '../wallet/wallet';
import options from '../options/options';

import './App.css';

class App extends Component {

  constructor(props,context) {
    super(props,context);

    this.main = React.createRef();
    
    this.onHandleLogin = this.onHandleLogin.bind(this);
    this.onShowHeader = this.onShowHeader.bind(this);
    this.onHandleNetworkChanging = this.onHandleNetworkChanging.bind(this);

    this.state = {
      isLogged : false,
      network : {},
      showHeader : false
    }
  }

  async componentWillMount(){

    //check if the current network has been already set, if no => set to testnet (options[0])
    let network = await getCurrentNewtwork();
    console.log(network);
    if ( !network ){
      network = options.network[0];
      await setCurrentNetwork(options.network[0]);
      await iotaInit(options.network[0].provider);
    }
    else  
      await iotaInit(network.provider);
      
    this.setState({network : network});
  }

  onHandleLogin(value){
    this.setState({isLogged : value});
  }
  onShowHeader(value){
    this.setState({showHeader : value});
  }
  async onHandleNetworkChanging(network){
    await iotaInit(network.provider);
    await setCurrentNetwork(network);

    this.main.current.changeNetwork(network);
  }


  render() {
    return (
      <div className="app chrome">
        {this.state.showHeader ? <Header isLogged={this.state.isLogged} changeNetwork={this.onHandleNetworkChanging}/> : '' }
        <Main  showHeader={this.onShowHeader} ref={this.main} currentNetwork={this.state.network}/>
      </div>
    );
  }
}

export default App;
