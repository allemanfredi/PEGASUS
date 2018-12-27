import React , { Component } from 'react';
import {checkPsw} from '../../wallet/wallet'
import {startSession} from '../../utils/utils'
import history from '../../components/history';

import './Login.css'

class InitPsw extends Component {

    constructor(props, context) {
      super(props, context);

      this.clickLogin = this.clickLogin.bind(this);
      this.handleChangePsw = this.handleChangePsw.bind(this);

      this.state = {
        psw: '',
        error: '',
        showError : false
      };
    }

    clickLogin(){
    
        if ( checkPsw(this.state.psw)){
            if ( startSession() ) this.props.onSuccess();//history.push('/home');
        }else{
          this.setState({showError : true})
          this.setState({error : 'Wrong Password'})
        }
    }

    handleChangePsw(e) {
      this.setState({showError : false})
      this.setState({ psw: e.target.value });
    }


    render() {
      return (
        <div class="container-login">
            <div class="container-logo">
                <img src="./material/logo/pegasus-128.png" height="80" width="80"/>
            </div>
            <div class="container-title">
                Pegasus
            </div>
            <div class="container-center">
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
                      <button onClick={this.clickLogin} type="submit" class="btn btn-password">Login <span class="fa fa-arrow-right"></span></button>
                  </div>
                  <div class="col-2"></div>
              </div>
          </div>
          {this.state.showError ? 
              <div class="alert alert-danger" role="alert">
                  <strong>Error</strong> {this.state.error}
              </div>
          : ''}
          </div>
      );
    }
  }

export default InitPsw;