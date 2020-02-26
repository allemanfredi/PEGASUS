import React, { Component } from 'react'
import QRCode from 'qrcode.react'
import Utils from '@pegasus/utils/utils'

class Receive extends Component {
  constructor(props, context) {
    super(props, context)

    this.copyToClipboard = this.copyToClipboard.bind(this)

    this.state = {}
  }

  copyToClipboard(e) {
    const textField = document.createElement('textarea')
    textField.innerText = Utils.checksummed(
      this.props.account.data.latestAddress
    )
    document.body.appendChild(textField)
    textField.select()
    document.execCommand('copy')
    textField.remove()
    this.props.setNotification({
      type: 'success',
      text: 'Copied!',
      position: 'under-bar'
    })
  }

  render() {
    return (
      <div className="container">
        <div className="row mt-5">
          <div className="col-12 text-center">
            <QRCode
              value={Utils.checksummed(this.props.account.data.latestAddress)}
            />
          </div>
        </div>
        <div className="row mt-5 justify-content-center">
          <div className="col-10 text-center text-xs break-text border-light-gray pt-1 pb-1">
            {Utils.checksummed(this.props.account.data.latestAddress)}
          </div>
        </div>
        <div className="row mt-10">
          <div className="col-12">
            <button
              onClick={this.copyToClipboard}
              className="btn btn-blue text-bold btn-big"
            >
              <span className="fa fa-clipboard"></span> Copy to clipboard
            </button>
          </div>
        </div>
      </div>
    )
  }
}

export default Receive
