import React , { Component } from 'react';
import {getCurrentNewtwork} from '../../wallet/wallet';

import options from '../../options/options'

import './Header.css'

class Header extends Component {
  constructor(props, context) {
    super(props, context);

    this.switchNetwork = this.switchNetwork.bind(this);

    this.state = {
      value:'',
      network:{},
      showNetworks : false
    }
  }

  async componentWillMount(){
    const network = await getCurrentNewtwork();
    this.setState({network:network});
  }

  switchNetwork(network){
    this.setState({showNetworks : false})
    this.setState({network:network});
    this.props.changeNetwork(network);
  }

  render() {

    return (
      <header>
        <div class="row">
          <div class="col-2 container-header-logo">
              <img src="./material/logo/pegasus-64.png" height="40" width="40"/>
          </div>
          <div class="col-1"></div>
          <div class="col-8">
            <div class="row container-selection">
              <div class="col-2"> <i class="fa fa-signal"></i></div>
              <div class="col-8 text-center">{this.state.network.name}</div>
              <div class="col-2">
              <div onClick={e => {this.setState({showNetworks : !this.state.showNetworks})}} class="">
                  { this.state.showNetworks ? <span class="fa fa-chevron-up"></span>  : <span class="fa fa-chevron-down"></span> }
                </div>
              </div>
            </div>
          </div>
          <div class="col-1"></div>
        </div>
        { this.state.showNetworks ? 
          <div class="container-hidden-network">
            <div class="container-hidden-network-header">Nodes</div>
            <div class="container-hidden-network-body">
              {options.network.map( (network,index) => {
                return(
                  <div onClick={() => this.switchNetwork(network)} class="container-hidden-network-item">
                      
                      <div class="container-icon-check">
                        { this.state.network.id === network.id ? 
                          <span class="fa fa-check"></span>
                        :''}
                      </div>
                      { this.state.network.id === network.id ? 
                        <div class="container-hidden-network-item-name-selected">{network.name}</div>
                      : <div class="container-hidden-network-item-name-not-selected">{network.name}</div>}
                  </div>
                )
                })}
            </div>
          </div>
              :''}
      </header>

        
    );
  }
}
  
  export default Header;
