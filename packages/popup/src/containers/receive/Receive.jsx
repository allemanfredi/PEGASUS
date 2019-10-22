import React, { Component } from 'react'
import QRCode from 'qrcode.react'
import Utils from '@pegasus/lib/utils'

class Receive extends Component {
  constructor(props, context) {
    super(props, context)

    this.copyToClipboard = this.copyToClipboard.bind(this)
  }

  copyToClipboard(e) {
    const textField = document.createElement('textarea')
    textField.innerText = Utils.checksummed(this.props.account.data.latestAddress)
    document.body.appendChild(textField)
    textField.select()
    document.execCommand('copy')
    textField.remove()
  }

  render() {
    return (
      <div className='container'>
        <div className='row mt-5'>
          <div className='col-12 text-center'>
            <QRCode value={this.props.account.data.latestAddress} />
          </div>
        </div>
        <div className="row mt-4">
          <div className="col-12 text-center text-blue text-xs text-bold">
            Address:
          </div>
        </div>
        <div className='row mt-2'>
          <div className='col-1'></div>
          <div className='col-10 text-center text-xs break-text' >
            {
              Utils.checksummed(this.props.account.data.latestAddress)
            }
          </div>
          <div className='col-1'></div>
        </div>
        <div className="row mt-5">
          <div className="col-2"></div>
          <div className="col-8">
            <button onClick={this.copyToClipboard} className='btn btn-blue text-bold btn-big'><span className='fa fa-clipboard'></span> Copy to clipboard</button>
          </div>
          <div className="col-2"></div>
        </div>
      </div>
    )
  }
}

export default Receive