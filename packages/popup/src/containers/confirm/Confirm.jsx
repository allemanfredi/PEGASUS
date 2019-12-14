import React, { Component } from 'react'
import { popupMessanger } from '@pegasus/utils/messangers'
import Utils from '@pegasus/utils/utils'
import Loader from '../../components/loader/Loader'

class Confirm extends Component {

  constructor(props, context) {
    super(props, context)

    this.reject = this.reject.bind(this)
    this.confirm = this.confirm.bind(this)

    this.state = {
      transfers: [],
      currentTransactionIndex: 0,
      isLoading: false,
      error: false
    }
  }

  async componentWillMount() {
    const transfers = await popupMessanger.getTransfers()
    this.setState({ transfers })
  }

  async reject(transfer) {

    await popupMessanger.rejectTransfer(transfer)
    const transfers = await popupMessanger.getTransfers()
    this.setState({ transfers })
    if (transfers.length === 0)
      this.props.onNotConfirms()
  }

  changeTransfers(transfers) {
    this.setState({ transfers })
  }

  setConfirmationLoading(isLoading) {
    this.setState({ isLoading })
  }

  setConfirmationError(error) {
    this.setState({ error })
  }

  setConfirmationCallback(callback) {
    this.setState({ callback })
  }

  async confirm(transfer) {
    await popupMessanger.confirmTransfers(transfer)
  }

  render() {
    return (
      !this.state.isLoading
        ? this.state.transfers.filter((obj, index) => index === this.state.currentTransactionIndex)
          .map(multiTransfer => {
            return (
              <div className="container">
                <div className="row mt-3">
                  <div className='col-2'>
                    <img className="border-radius-50" src='./material/logo/pegasus-64.png' height='50' width='50' alt='pegasus logo' />
                  </div>
                  <div className="col-10 text-right text-blue text-md">Confirm Transfer</div>
                </div>

                <hr className="mt-2 mb-2"/>
                <div class="container-confirm-transfers">
                  {
                    multiTransfer.transfer.args[0].map((singleTransfer, index) => {
                      return (
                        <React.Fragment>
                          {
                            index > 0
                              ?  <hr className="mt-1 mb-1"/>
                              : ''
                          }
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
                            <div className="col-2 text-left text-xxs text-blue">Message</div>
                            <div className="col-10 text-right text-xs break-text">
                              {
                                singleTransfer.message
                                  ? singleTransfer.message
                                  : '-'
                              }
                            </div>
                          </div>
                          <div className="row mt-2">
                            <div className="col-2 text-left text-xxs text-blue">Amount</div>
                            <div className="col-10 text-right text-md break-text">
                              {Utils.iotaReducer(singleTransfer.value)}
                            </div>
                          </div>
                        </React.Fragment>
                      )
                    })
                  }
                </div>
                {
                  this.state.error
                    ? <div className="row mt-2">
                      <div className="col-12 text-xs">
                        <div class="alert alert-danger" role="alert">
                          {this.state.error}
                        </div>
                      </div>
                    </div>
                    : ''
                }
                <hr className="mt-1 mb-1" />
                <div className={this.state.error ? "row mt-3" : "row mt-4"}>
                  <div className="col-6 pr-5 pl-5">
                    <button onClick={() => this.reject(multiTransfer)} className="btn btn-border-blue text-sm text-bold btn-big">
                      Reject
                    </button>
                  </div>
                  <div className="col-6 pr-5 pl-5">
                    <button onClick={() => this.confirm(multiTransfer)} className="btn btn-blue text-sm text-bold btn-big">
                      Confirm
                    </button>
                  </div>
                </div>
                <div className="row mt-1">
                  <div className="col-12 text-center pr-5 pl-5">
                    <button onClick={() => this.props.onRejectAll()} type='submit' className='btn btn-border-blue text-bold btn-big'>
                      Reject all
                    </button>
                  </div>
                </div>
                <div className="row mt-1">
                  <div className="col-12 text-center text-xxs text-blue">
                    {this.state.transfers.length} transfers
                  </div>
                </div>
              </div>
            )
          }
          )
        :
        <Loader />
    )
  }
}

export default Confirm