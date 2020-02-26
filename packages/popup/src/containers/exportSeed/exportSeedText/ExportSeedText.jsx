import React, { Component } from 'react'
import { popupMessanger } from '@pegasus/utils/messangers'
import Unlock from '../../unlock/Unlock'

class ExportSeedText extends Component {
  constructor(props, context) {
    super(props, context)

    this.getSeed = this.getSeed.bind(this)
    this.copyToClipboard = this.copyToClipboard.bind(this)

    this.state = {
      seed: null
    }
  }

  async getSeed(password) {
    const seed = await popupMessanger.unlockSeed(password)
    this.setState({
      seed
    })
  }

  copyToClipboard(e) {
    const textField = document.createElement('textarea')
    textField.innerText = this.props.account.data.latestAddress
    document.body.appendChild(textField)
    textField.select()
    document.execCommand('copy')
    textField.remove()

    this.props.setNotification({
      type: 'success',
      text: 'Copied!'
    })
  }

  render() {
    return !this.state.seed ? (
      <Unlock onUnlock={this.getSeed} />
    ) : (
      <div className="container">
        <div className="row mt-3 mb-3">
          <div className="col-12 text-center text-lg text-blue text-bold">
            Please keep it as safely as possible!
          </div>
        </div>
        <div className="row mt-10">
          <div className="col-10 mx-auto text-center text-xs break-text border-light-gray pt-1 pb-1">
            {this.state.seed}
          </div>
        </div>
        <div className="row mt-10">
          <div className="col-12">
            <button
              onClick={this.copyToClipboard}
              type="button"
              className="btn btn-blue text-bold btn-big"
            >
              Copy To Clipboard
            </button>
          </div>
        </div>
      </div>
    )
  }
}

export default ExportSeedText
