import React, { Component } from 'react';
import { PopupAPI } from '@pegasus/lib/api';

class ExportSeed extends Component {

  constructor(props, context) {

    super(props, context);

    this.getSeed = this.getSeed.bind(this);
    this.copyToClipboard = this.copyToClipboard.bind(this);

    this.state = {
      psw: '',
      seed: null,
      shake: false
    };
  }

  async getSeed(e) {
    e.preventDefault();
    //reset shake every click in order to shake more times
    this.setState({ shake: false });

    const seed = await PopupAPI.unlockSeed(this.state.psw);
    this.setState({
      seed,
      psw: '',
      shake: !seed ? true : false
    });
  }

  copyToClipboard(e) {
    const textField = document.createElement('textarea');
    textField.innerText = this.props.account.data.latestAddress;
    document.body.appendChild(textField)
    textField.select()
    document.execCommand('copy')
    textField.remove()
  }

  render() {
    return (
      <div className={this.state.shake ? 'container shake' : 'container'}>
        <div className='row mt-3 mb-3'>
          <div className='col-12 text-center text-lg text-blue text-bold'>
            {
              !this.state.seed 
                ? 'Insert your password to export the seed'
                : 'Please keep it as safely as possible!'
            }'
          </div>
        </div>
        {
          !this.state.seed ?
            <React.Fragment>
              <div className='row mt-20'>
                <div className='col-12'>
                  <form onSubmit={this.getSeed}>
                    <label htmlFor='inp-psw' className='inp'>
                      <input value={this.state.psw} onChange={e => this.setState({ psw: e.target.value })} type='password' id='inp-psw' placeholder='&nbsp;' />
                      <span className='label'>password</span>
                      <span className='border'></span>
                    </label>
                  </form>
                </div>
              </div>
              <div className='row mt-3'>
                <div className='col-12'>
                  <button disabled={!this.state.psw.length > 0} onClick={this.getSeed} type='submit' className='btn btn-blue text-bold btn-big'>Unlock</button>
                </div>
              </div>
            </React.Fragment>
            :
            <React.Fragment>
              <div className='row mt-10'>
                <div className='col-1'></div>
                <div className='col-10 text-center text-xs break-text border-light-gray pt-1 pb-1'>
                  {this.state.seed}
                </div>
                <div className='col-1'></div>
              </div>
              <div className='row mt-10'>
                <div className='col-12'>
                  <button onClick={this.copyToClipboard} type='button' className='btn btn-blue text-bold btn-big'>Copy To Clipboard</button>
                </div>
              </div>
            </React.Fragment>
        }
      </div>
    )
  }
}

export default ExportSeed;