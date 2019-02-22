import React , { Component } from 'react';
import QRCode from 'qrcode.react';


import './Receive.css'

class Receive extends Component {

    constructor(props, context) {
      super(props, context);
    
    }

    render() {
      return (
        <div className="container-receive">
          <div className="container-qr-code">
            <div className="row">
              <div className="col-12 text-center">
                <QRCode value={this.props.account.data.latestAddress} />
              </div>
            </div>
          </div>
          <div className="container-address">
            <div className="row">
              <div className="col-2"></div>
              <div className="col-8 text-center">
                <label className="label-address" >
                  {this.props.account.data.latestAddress}
                </label>
              </div>
              <div className="col-2"></div>
            </div>
          </div>
       </div> 
      );
    }
  }

export default Receive;