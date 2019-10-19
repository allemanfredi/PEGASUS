import React, { Component } from 'react';
import { PopupAPI } from '@pegasus/lib/api';


class Login extends Component {
  constructor(props, context) {
    super(props, context);

    this.clickLogin = this.clickLogin.bind(this);

    this.state = {
      psw: '',
      error: '',
      shake: false
    };
  }

  async clickLogin(e) {
    e.preventDefault();

    this.setState({ shake: false });

    const canAccess = await PopupAPI.comparePassword(this.state.psw)
    if (canAccess) {
      PopupAPI.setPassword(this.state.psw);

      //start encryption storage service
      PopupAPI.initStorageDataService(this.state.psw);

      PopupAPI.unlockWallet(this.state.psw);

      PopupAPI.startSession();
      this.props.onSuccess();
    } else {
      this.setState({ shake: true });
    }
  }

  render() {
    return (
      <div className={this.state.shake ? 'container shake' : 'container'}>
        <div className='container-logo-login mt-5'>
          <img src='./material/logo/pegasus-128.png' height='80' width='80' alt='pegasus logo' />
        </div>
        <div className='row'>
          <div className='col-12 text-center text-lg text-blue mt-1'>
            Pegasus
          </div>
        </div>
        <div className='row mt-8'>
          <div className='col-12'>
            <form onSubmit={this.clickLogin}>
              <label htmlFor='inp-psw ' className='inp'>
                <input onChange={e => this.setState({ psw: e.target.value })} type='password' id='inp-psw' placeholder='&nbsp;' />
                <span className='label'>password</span>
                <span className='border'></span>
              </label>
            </form>
          </div>
        </div>
        <div className='row mt-3'>
          <div className='col-12 text-center'>
            <button disabled={!this.state.psw.length > 0} onClick={this.clickLogin} type='submit' className='btn btn-blue text-bold btn-big'>Login</button>
          </div>
        </div>
        <div className='row mt-1'>
          <div className='col-12 text-center'>
            <button onClick={e => { this.props.onRestore(); }} type='submit' className='btn btn-white '>Restore from seed</button>
          </div>
        </div>
      </div>
    );
  }
}

export default Login;