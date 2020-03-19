import React, { Component } from 'react'
import Utils from '@pegasus/utils/utils'
import Loader from '../../../components/loader/Loader'

class ConfirmTransfers extends Component {
  constructor(props, context) {
    super(props, context)
  }

  render() {
    return !this.props.isLoading ? (
      <div className="container">
        <div className="row mt-3">
          <div className="col-2">
            <img
              className="border-radius-50"
              src="./material/logo/pegasus-64.png"
              height="50"
              width="50"
              alt="pegasus logo"
            />
          </div>
          <div className="col-10 text-right text-blue text-md">
            Confirm Transfer
          </div>
        </div>

        <hr className="mt-2 mb-2" />
        <div class="container-confirm-transfers">
          {this.props.transfer.args[0].map((singleTransfer, index) => {
            return (
              <React.Fragment>
                {index > 0 ? <hr className="mt-1 mb-1" /> : ''}
                <div className="row">
                  <div className="col-12 text-left text-xs text-light">
                    #{index}
                  </div>
                </div>
                <div className="row">
                  <div className="col-2 text-left text-xxs text-blue">To</div>
                  <div className="col-10 text-right text-sm break-text font-weight-bold">
                    {Utils.showAddress(singleTransfer.address, 10, 10)}
                  </div>
                </div>
                <div className="row mt-2">
                  <div className="col-2 text-left text-xxs text-blue">
                    Message
                  </div>
                  <div className="col-10 text-right text-xs break-text">
                    {singleTransfer.message ? singleTransfer.message : '-'}
                  </div>
                </div>
                <div className="row mt-2">
                  <div className="col-2 text-left text-xxs text-blue">
                    Amount
                  </div>
                  <div className="col-10 text-right text-md break-text">
                    {Utils.iotaReducer(singleTransfer.value)}
                  </div>
                </div>
              </React.Fragment>
            )
          })}
        </div>
        {this.props.error ? (
          <div className="row mt-2">
            <div className="col-12 text-xs">
              <div class="alert alert-danger" role="alert">
                {this.props.error}
              </div>
            </div>
          </div>
        ) : (
          ''
        )}
        <hr className="mt-1 mb-1" />
        <div className={this.props.error ? 'row mt-4' : 'row mt-12'}>
          <div className="col-6 pr-5 pl-5">
            <button
              onClick={() => this.props.onReject(this.props.transfer)}
              className="btn btn-border-blue text-sm text-bold btn-big"
            >
              Reject
            </button>
          </div>
          <div className="col-6 pr-5 pl-5">
            <button
              onClick={() => this.props.onConfirm(this.props.transfer)}
              className="btn btn-blue text-sm text-bold btn-big"
            >
              Confirm
            </button>
          </div>
        </div>
        {/*<div className="row mt-1">
              <div className="col-12 text-center pr-5 pl-5">
                <button onClick={() => this.props.onRejectAll()} type='submit' className='btn btn-border-blue text-bold btn-big'>
                  Reject all
                </button>
              </div>
            </div>
            <div className="row mt-1">
              <div className="col-12 text-center text-xxs text-blue">
                {this.props.transfer} transfers
                    </div>
          </div>*/}
      </div>
    ) : (
      <Loader />
    )
  }
}

export default ConfirmTransfers
