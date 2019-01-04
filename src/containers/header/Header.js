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
          <div class="container-header">
            <div class="container-header-logo">
              <img src="./material/logo/pegasus-64.png" height="40" width="40"/>
            </div>
            <div class="container-selection">
                <div class="container-signal-icon">
                  <i class="fa fa-signal"></i>
                </div>
                <div class="selected-network">
                  {this.state.network.name}
                </div>
                <div onClick={e => {this.setState({showNetworks : !this.state.showNetworks})}} class="btn-show-hidden-network">
                  { this.state.showNetworks ? <span class="fa fa-chevron-up"></span>  : <span class="fa fa-chevron-down"></span> }
                </div>
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
          </div>
            
        </header>
    );
  }
}
  
  export default Header;

  /*<select onChange={this.onChangeOption}>
                <option value="default" selected disabled hidden>{this.state.network? this.state.network.provider : ''}</option>
                {options.network.map( (option,index) => {return(<option value={index}>{option.provider}</option>)} )}
              </select>*/