import React from 'react'
import QRCode from 'qrcode.react'
import Utils from '@pegasus/utils/utils'

const AccountInfo = props => {
  const copyToClipboard = () => {
    const textField = document.createElement('textarea')
    textField.innerText = Utils.checksummed(props.account.data.latestAddress)
    document.body.appendChild(textField)
    textField.select()
    document.execCommand('copy')
    textField.remove()
    props.setNotification({
      type: 'success',
      text: 'Copied!',
      position: 'under-bar'
    })
  }

  return (
    <div className="container">
      <div className="row mt-5">
        <div className="col-12 text-center">
          <QRCode value={Utils.checksummed(props.account.data.latestAddress)} />
        </div>
      </div>
      <div className="row mt-3 justify-content-center">
        <div className="col-10 text-center text-xs break-text border-light-gray pt-1 pb-1">
          {Utils.checksummed(props.account.data.latestAddress)}
        </div>
      </div>
      <div className="row mt-9">
        <div className="col-12">
          <button
            onClick={copyToClipboard}
            className="btn btn-blue text-bold btn-big"
          >
            <span className="fa fa-clipboard"></span> Copy to clipboard
          </button>
        </div>
      </div>
    </div>
  )
}

export default AccountInfo
