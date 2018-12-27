import React , { Component } from 'react';
import {getCurrentAccount} from '../../wallet/wallet'
import history from '../../components/history'

import QRCode from 'qrcode.react';


import './Receive.css'

class Receive extends Component {

    constructor(props, context) {
      super(props, context);
    
    }

    render() {
      return (
        <div class="container-receive">
          <div class="container-qr-code">
            <div class="row">
              <div class="col-12 text-center">
                <QRCode value={this.props.account.data.latestAddress} />
              </div>
            </div>
          </div>
          <div class="container-address">
            <div class="row">
              <div class="col-2"></div>
              <div class="col-8 text-center">
                <label class="label-address" >
                  {this.props.account.data.latestAddress}
                </label>
              </div>
              <div class="col-2"></div>
            </div>
          </div>
       </div> 
      );
    }
  }

export default Receive;