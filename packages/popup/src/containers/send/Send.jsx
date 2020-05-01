import React, { Component } from 'react'
import Utils from '@pegasus/utils/utils'
import Input from '../../components/input/Input'
import Picklist from '../../components/picklist/Picklist'

class Send extends Component {
  constructor(props, context) {
    super(props, context)

    this.clickTransfer = this.clickTransfer.bind(this)
    this.loadAccounts = this.loadAccounts.bind(this)

    this.state = {
      address: '',
      seed: '',
      dstAddress: '',
      tag: '',
      value: '',
      message: '',
      isLoading: false,
      error: null,
      isTransferingBetweenWalletAccounts: false,
      accounts: {}
    }
  }

  componentDidUpdate(prevProps) {
    if (prevProps.account.id !== this.props.account.id) {
      this.loadAccounts()
    }
  }

  componentDidMount() {
    this.loadAccounts()
  }

  async loadAccounts() {
    let accounts = await this.props.background.getAllAccounts()
    accounts = accounts.filter(account => account.id !== this.props.account.id)
    this.setState({ accounts })
  }

  async clickTransfer() {
    if (!Utils.isValidAddress(this.state.dstAddress)) {
      this.props.setNotification({
        type: 'danger',
        text: 'Invalid Address',
        position: 'under-bar'
      })
      return
    }

    const transfer = [
      {
        tag: this.state.tag,
        address: this.state.dstAddress,
        value: this.state.value ? this.state.value : 0,
        message: this.state.message
      }
    ]

    const { response, success } = await this.props.background.send({
      method: 'transfer',
      args: [transfer]
    })

    if (!success) {
      this.props.setNotification({
        type: 'danger',
        text: response,
        position: 'under-bar'
      })
    } else {
      this.props.setNotification({
        type: 'success',
        text: 'Transfer was successful',
        position: 'under-bar'
      })
    }
  }

  render() {
    return (
      <div className="container overflow-auto-475h">
        <div>
          <div className="row mt-2">
            <div className="col-12">
              {this.state.isTransferingBetweenWalletAccounts ? (
                <div className="mt-07">
                  <Picklist
                    placeholder="Select account"
                    text={this.state.dstAddress}
                    options={this.state.accounts.map(account => {
                      return (
                        <React.Fragment>
                          <div className="row">
                            <div className="col-2 my-auto">
                              <img
                                className="border-radius-50 cursor-pointer"
                                src={`./material/profiles/${
                                  account.avatar ? account.avatar : 1
                                }.svg`}
                                height="30"
                                width="30"
                                alt={`avater logo ${account.name}`}
                              />
                            </div>
                            <div className="col-10 pl-0">
                              <div className="row">
                                <div className="col-12 text-xs">
                                  {account.name}
                                </div>
                                <div className="col-12 text-xxxs">
                                  {Utils.showAddress(
                                    Utils.checksummed(
                                      account.data[this.props.network.type]
                                        .latestAddress
                                    ),
                                    18,
                                    23
                                  )}
                                </div>
                              </div>
                            </div>
                          </div>
                        </React.Fragment>
                      )
                    })}
                    onSelect={index =>
                      this.setState({
                        dstAddress: Utils.checksummed(
                          this.state.accounts[index].data.latestAddress
                        )
                      })
                    }
                  />
                </div>
              ) : (
                <Input
                  value={this.state.dstAddress}
                  onChange={e => this.setState({ dstAddress: e.target.value })}
                  label="address"
                  id="inp-address"
                />
              )}
            </div>
          </div>
          <div className="row mt-1">
            <div
              className="col-12 text-blue text-xxs text-underline cursor-pointer"
              onClick={() =>
                this.setState({
                  isTransferingBetweenWalletAccounts: !this.state
                    .isTransferingBetweenWalletAccounts,
                  dstAddress: ''
                })
              }
            >
              {this.state.isTransferingBetweenWalletAccounts
                ? 'Normal Transfer'
                : 'Transfer between my accounts'}
            </div>
          </div>
          <div className="row mt-4">
            <div className="col-12">
              <Input
                value={this.state.message}
                onChange={e => this.setState({ message: e.target.value })}
                label="message"
                id="inp-message"
              />
            </div>
          </div>
          <div className="row mt-3">
            <div className="col-6">
              <Input
                value={this.state.tag}
                onChange={e => this.setState({ tag: e.target.value })}
                label="tag"
                id="inp-tag"
              />
            </div>
            <div className="col-6">
              <Input
                value={this.state.value}
                onChange={e => this.setState({ value: e.target.value })}
                label="value"
                id="inp-value"
                type="number"
              />
            </div>
          </div>

          {this.state.value >
          this.props.account.data[this.props.network.type].balance ? (
            <div className="row mt-4">
              <div className="col-12 text-xs">
                <div class="alert alert-danger" role="alert">
                  Insufficent funds
                </div>
              </div>
            </div>
          ) : null}

          <div
            className={
              this.state.value >
              this.props.account.data[this.props.network.type].balance
                ? 'row mt-2'
                : 'row mt-11'
            }
          >
            <div className="col-12 text-center">
              <button
                disabled={
                  this.state.dstAddress === '' ||
                  this.state.value >
                    this.props.account.data[this.props.network.type].balance
                    ? true
                    : false
                }
                onClick={this.clickTransfer}
                className="btn btn-blue text-bold btn-big"
              >
                Send
              </button>
            </div>
          </div>
          <div className="row mt-2">
            <div className="col-12 text-center text-xxs text-blue">
              Address is mandatory. if value is empty it's interpreted as 0 and
              the wallet will generate a 0 value transaction
            </div>
          </div>
        </div>
      </div>
    )
  }
}

export default Send
