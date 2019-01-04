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
        <div class="container-login">
            <div class="container-logo-login">
                <img src="./material/logo/pegasus-128.png" height="80" width="80"/>
            </div>
            <div class="container-title-login">
                Pegasus
            </div>
            <div class="container-center-login">
              <div class="row">
                  <div class="col-2"></div>
                  <div class="col-8">
                    <label for="inp-psw" class="inp">
                        <input onChange={this.handleChangePsw} type="password" id="inp-psw" placeholder="&nbsp;"/>
                        <span class="label">password</span>
                        <span class="border"></span>
                    </label>
                  </div>
                  <div class="col-2"></div>
              </div>
              <div class="row">
                  <div class="col-2"></div>
                  <div class="col-8 text-center">
                      <button disabled={checkPsw(this.state.psw) ? false : true} onClick={this.clickLogin} type="submit" class="btn btn-password">LOGIN</button>
                  </div>
                  <div class="col-2"></div>
              </div>
          </div>
          <div class="container-restore-login">
            <div class="row">
                <div class="col-2"></div>
                <div class="col-8 text-center">
                  <button onClick={e => {this.props.onRestore()}} type="submit" class="btn btn-restore">restore from seed</button>
                </div>
                <div class="col-2"></div>
            </div>
          </div>
        </div>
      );
    }
  }

export default InitPsw;