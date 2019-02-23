import React , { Component } from 'react';
import {checkPsw} from '../../wallet/wallet'
import {startSession} from '../../utils/utils'

import './Login.css'

class InitPsw extends Component {

    constructor(props, context) {
      super(props, context);

      this.clickLogin = this.clickLogin.bind(this);
      this.handleChangePsw = this.handleChangePsw.bind(this);

      this.state = {
        psw: '',
        error: '',
      };
    }

    clickLogin(){
        if ( startSession() ) 
            this.props.onSuccess();//history.push('/home');
    }

    handleChangePsw(e) {
      this.setState({showError : false})
      this.setState({ psw: e.target.value });
    }


    render() {
      return (
        <div className="container-login">
            <div className="container-logo-login">
                <img src="./material/logo/pegasus-128.png" height="80" width="80" alt='pegasus logo'/>
            </div>
            <div className="row">
              <div className="col-12 text-center title-login">
                Pegasus
              </div>
            </div>
            <div className="row">
                <div className="col-2"></div>
                <div className="col-8">
                  <label for="inp-psw" className="inp">
                      <input onChange={this.handleChangePsw} type="password" id="inp-psw" placeholder="&nbsp;"/>
                      <span className="label">password</span>
                      <span className="border"></span>
                  </label>
                </div>
                <div className="col-2"></div>
            </div>
            <div className="row">
                <div className="col-2"></div>
                <div className="col-8 text-center">
                    <button disabled={checkPsw(this.state.psw) ? false : true} onClick={this.clickLogin} type="submit" className="btn btn-password">Login</button>
                </div>
                <div className="col-2"></div>
            </div>
          <div className="row">
              <div className="col-2"></div>
              <div className="col-8 text-center">
                <button onClick={e => {this.props.onRestore()}} type="submit" className="btn btn-restore">restore from seed</button>
              </div>
              <div className="col-2"></div>
          </div>
        </div>
      );
    }
  }

export default InitPsw;