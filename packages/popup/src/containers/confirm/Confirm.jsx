import React, { Component } from 'react';
import { PopupAPI } from '@pegasus/lib/api';

import Utils from '@pegasus/lib/utils';
import Loader from '../../components/loader/Loader';

class Confirm extends Component {

  constructor(props, context) {
    super(props, context);

    this.reject = this.reject.bind(this);
    this.confirm = this.confirm.bind(this);

    this.state = {
      payments: [],
      currentTransactionIndex: 0,
      isLoading: false,
      error: false
    }
  }

  async componentWillMount() {
    const payments = await PopupAPI.getPayments();
    this.setState({ payments });
  }

  async reject(payment) {

    await PopupAPI.rejectPayment(payment);
    const payments = await PopupAPI.getPayments();
    this.setState({ payments });
    if (payments.length === 0)
      this.props.onNotConfirms();
  }

  changePayments(payments) {
    this.setState({ payments });
  }
  setConfirmationLoading(isLoading) {
    this.setState({ isLoading });
  }
  setConfirmationError(error) {
    this.setState({ error });
  }
  setConfirmationCallback(callback) {
    this.setState({ callback });
  }

  async confirm(payment) {
    await PopupAPI.confirmPayment(payment);
  }

  render() {
    return (
      !this.state.isLoading ? this.state.payments.filter((obj, index) => index === this.state.currentTransactionIndex).map(obj => {
        return (
          <div className="container overflow-auto-600h">
            <div className="row mt-3">
              <div className='col-2'>
                <img src='./material/logo/pegasus-64.png' height='30' width='30' alt='pegasus logo' />
              </div>
              <div className="col-10 text-right text-blue text-md">Confirm Payment</div>
            </div>
            <hr className="mt-2 mb-2" />
            <div className="row ">
              <div className="col-2 text-left text-xs text-blue">To</div>
              <div className="col-10 text-right text-xxs break-text"><div className="">{obj.payment.args[0][0].address}</div></div>
            </div>
            <div className="row mt-2">
              <div className="col-12 text-center text-blue text-xs">Amount</div>
            </div>
            <div className="row">
              <div className="col-12 text-center text-bold text-black text-md">{Utils.iotaReducer(obj.payment.args[0][0].value)}</div>
            </div>
            <div className="row mt-2">
              <div className="col-2 text-left text-xs text-blue">Message</div>
              <div className="col-10 text-right break-text"><div className="">{obj.payment.args[0][0].message ? obj.payment.args[0][0].message : '-'}</div></div>
            </div>
            {
              this.state.error ?
                <div className="row mt-2">
                  <div className="col-12 text-xs">
                    <div class="alert alert-danger" role="alert">
                      {this.state.error}
                    </div>
                  </div>
                </div>
              : ''
            }
            <hr className="mt-1 mb-1" />
            <div className={this.state.error ? "row mt-3" : "row mt-9"}>
              <div className="col-6">
                <button onClick={() => this.reject(obj)} className="btn btn-border-blue text-sm text-bold">Reject</button>
              </div>
              <div className="col-6">
                <button onClick={() => this.confirm(obj)} className="btn btn-blue text-sm text-bold">Confirm</button>
              </div>
            </div>
            <div className="row mt-1">
              <div className="col-12 text-center">
                <button onClick={() => this.props.onRejectAll()} type='submit' className='btn btn-border-blue text-bold'>Reject all</button>
              </div>
            </div>
            <div className="row mt-1">
              <div className="col-12 text-center text-xxs text-blue">{this.state.payments.length} transactions</div>
            </div>
          </div>
        )
      }) : <Loader />
    )
  }
}

export default Confirm;