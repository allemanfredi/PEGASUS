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
        <div>
        <QRCode value={this.props.account.data.latestAddress} />
        {this.props.account.data.latestAddress}
        </div> 
      );
    }
  }

export default Receive;