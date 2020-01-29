import React, { Component } from 'react'

class ConfirmChangeModeMamChannel extends Component {
  constructor(props, context) {
    super(props, context)

    this.state = {}
  }

  render() {
    return (
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
          <div className="col-10 text-right text-blue text-msm my-auto">
            Confirm MAM operation
          </div>
        </div>

        <hr className="mt-2 mb-2" />

        <div className="row mt-4">
          <div className="col-12 text-center text-md text-blue">
            Are you sure you want to change mode for a MAM channel?
          </div>
        </div>

        <div className="row mt-4">
          <div className="col-12 text-left text-xs text-black font-weight-bold">
            Details:
          </div>
        </div>

        <div className="row mt-2">
          <div className="col-6 text-left text-xxs my-auto text-gray">
            from:
          </div>
          <div className="col-6 text-right text-sm text-gray">
            {this.props.from}
          </div>
        </div>

        <div className="row mt-2">
          <div className="col-6 text-left text-xxs my-auto text-gray my-auto">
            to:
          </div>
          <div className="col-6 text-right text-md text-blue font-weight-bold">
            {this.props.to === '' ? 'public' : this.props.to}
          </div>
        </div>

        <div className="row mt-2">
          <div className="col-6 text-left text-xxs my-auto text-gray my-auto">
            sidekey:
          </div>
          <div className="col-6 text-right text-sm text-blue font-weight-bold">
            {this.props.sidekey ? this.props.sidekey : '-'}
          </div>
        </div>

        <hr className="mt-3 mb-2" />

        <div className="row mt-5">
          <div className="col-6 pl-5 pr-5">
            <button
              onClick={() => this.props.onReject(this.props.request)}
              className="btn btn-border-blue text-sm text-bold btn-big"
            >
              Reject
            </button>
          </div>
          <div className="col-6 pl-5 pr-5">
            <button
              onClick={() => this.props.onConfirm(this.props.request)}
              className="btn btn-blue text-sm text-bold btn-big"
            >
              Confirm
            </button>
          </div>
        </div>
      </div>
    )
  }
}

export default ConfirmChangeModeMamChannel
