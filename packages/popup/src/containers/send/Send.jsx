import React, { Component } from 'react'
import { PopupAPI } from '@pegasus/lib/api'
import Loader from '../../components/loader/Loader'
import Alert from '../../components/alert/Alert'
import Utils from '@pegasus/lib/utils'


class Send extends Component {
  constructor(props, context) {
    super(props, context)

    this.clickTransfer = this.clickTransfer.bind(this)

    this.state = {
      address: '',
      seed: '',
      dstAddress: '',
      tag: '',
      value: '',
      message: '',
      isLoading: false,
      error: null
    }
  }

  async clickTransfer() {
    this.setState({
      error: null
    })

    if (!Utils.isValidAddress(this.state.dstAddress)) {
      this.setState({
        error: 'Invalid Address'
      })
    }
    if (!Utils.isChecksummed(this.state.dstAddress)) {
      this.setState({
        error: 'Address should be 90 characters long and should have a checksum'
      })
      return
    }

    const transfer = [{
      tag: this.state.tag,
      address: this.state.dstAddress,
      value: this.state.value ? this.state.value : 0,
      message: this.state.message,
    }]
    const data = {
      args: [
        transfer,
      ],
      isPopup: true
    }

    PopupAPI.pushPayment(data)
    this.props.onAskConfirm()
  }

  render() {
    return (
      <div className="container">
        {
          !this.state.isLoading ?
            <div>
              <div className='row mt-4'>
                <div className='col-12'>
                  <label htmlFor='inp-address' className='inp'>
                    <input value={this.state.dstAddress} 
                      onChange={e => this.setState({ dstAddress: e.target.value })} 
                      type='text' id='inp-address' 
                      placeholder='&nbsp;' />
                    <span className='label'>address</span>
                    <span className='border'></span>
                  </label>
                </div>
              </div>
              <div className='row mt-4'>
                <div className='col-12'>
                  <label htmlFor='inp-message' className='inp'>
                    <input value={this.state.message} 
                      onChange={e => this.setState({ message: e.target.value })} 
                      type='text' 
                      id='inp-message' 
                      placeholder='&nbsp;' />
                    <span className='label'>message</span>
                    <span className='border'></span>
                  </label>
                </div>
              </div>
              <div className='row mt-4'>
                <div className='col-6'>
                  <label htmlFor='inp-tag' className='inp'>
                    <input value={this.state.tag} 
                      onChange={e => this.setState({ tag: e.target.value })} 
                      type='text' 
                      id='inp-message' 
                      placeholder='&nbsp;' />
                    <span className='label'>tag</span>
                    <span className='border'></span>
                  </label>
                </div>
                <div className="col-6">
                  <label htmlFor='inp-value' className='inp'>
                    <input value={this.state.value} 
                      onChange={e => this.setState({ value: e.target.value })} 
                      type='text' 
                      id='inp-value' 
                      placeholder='&nbsp;' />
                    <span className='label'>value</span>
                    <span className='border'></span>
                  </label>
                </div>
              </div>
              {
                this.state.error ?
                  <div className="row mt-3">
                    <div className="col-12 text-xs">
                      <div class="alert alert-danger" role="alert">
                        {this.state.error}
                      </div>
                    </div>
                  </div>
                : ''
              }
              <div className={'row ' + (this.state.error ? 'mt-1' : 'mt-6')}>
                <div className='col-12 text-center'>
                  <button disabled={this.state.dstAddress === '' ? true : false} 
                    onClick={this.clickTransfer}
                    className='btn btn-blue text-bold btn-big'>
                      Send
                  </button>
                </div>
              </div>
              <div className="row mt-3">
                <div className="col-12 text-center text-xs text-blue">Address is mandatory. if value is empty it's interpreted as 0 and the wallet will generate a 0 value transaction</div>
              </div>
            </div>
            : <Loader />
          }
      </div>
    )
  }
}

export default Send