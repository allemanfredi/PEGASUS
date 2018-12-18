import React , { Component } from 'react';
import {getCurrentAccount} from '../../wallet/wallet'
import history from '../../components/history'

import QRCode from 'qrcode.react';


import './Receive.css'

class Receive extends Component {

    constructor(props, context) {
      super(props, context);
    
      this.goBack = this.goBack.bind(this);

    }

    goBack(){
      this.props.onBack();
    }

    render() {
      return (
        <div>
          <div class="container settings">
            <div class="row">
              <div class="col-2">
                <button onClick={this.goBack} class="btn btn-back"><i class="fa fa-arrow-left"></i></button>
              </div>
              <div class="col-8"></div>
              <div class="col-2"></div>
            </div>
          </div>
        <QRCode value={this.props.account.data.latestAddress} />
        {this.props.account.data.latestAddress}
        </div> 
      );
    }
  }

export default Receive;