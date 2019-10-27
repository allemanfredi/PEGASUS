import React, { Component } from 'react'
import { PopupAPI } from '@pegasus/lib/api'

class Connector extends Component {

  constructor(props, context) {
    super(props, context)

    this.confirm = this.confirm.bind(this)

    this.state = {
      payments: [],
      currentTransactionIndex: 0,
      isLoading: false,
      error: false
    }
  }

  async confirm(payment) {
    await PopupAPI.confirmPayment(payment)
  }

  render() {
    return (
      <div className="container overflow-auto-600h">
        <div className="row mt-3">
          <div className='col-2'>
            <img src='./material/logo/pegasus-64.png' height='30' width='30' alt='pegasus logo' />
          </div>
          <div className="col-10 text-right text-blue text-md">Confirm Connection</div>
        </div>
        <div className={this.state.error ? "row mt-3" : "row mt-9"}>
          <div className="col-6">
            <button onClick={() => this.props.onPermissionNotGranted()} className="btn btn-border-blue text-sm text-bold">Reject</button>
          </div>
          <div className="col-6">
            <button onClick={() => this.props.onPermissionGranted()} className="btn btn-blue text-sm text-bold">Confirm</button>
          </div>
        </div>
      </div>
    )
  }
}

export default Connector