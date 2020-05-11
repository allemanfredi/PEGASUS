import React, { Component } from 'react'
import Utils from '@pegasus/utils/utils'
import IconedInput from '../../components/iconedInput/IconedInput'
import CheckBox from '../../components/checkbox/Checkbox'
import SelectWalletAccount from './selectWalletAccounts/SelectWalletAccounts'
import SendOptions from './sendOptions/SendOptions'
import { asciiToTrytes } from '@iota/converter'

const REQUESTED_REJECTED_BY_THE_USER = 'Request has been rejected by the user'

class Send extends Component {
  constructor(props, context) {
    super(props, context)

    this.send = this.send.bind(this)
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
      accounts: [],
      recents: [],
      viewRecents: 4
    }
  }

  componentDidUpdate(prevProps) {
    if (prevProps.account.id !== this.props.account.id) {
      this.loadAccounts()
    }
  }

  async componentDidMount() {
    this.loadAccounts()

    const recents = await this.props.background.getRecentsAddresses()
    this.setState({
      recents: recents[this.props.network.type]
        ? recents[this.props.network.type]
        : []
    })

    this.props.background.on('update', backgroundState => {
      const { selectedNetwork, recents } = backgroundState
      this.setState({
        recents:
          recents && recents[selectedNetwork.type]
            ? recents[selectedNetwork.type]
            : []
      })
    })
  }

  async loadAccounts() {
    let accounts = await this.props.background.getAllAccounts()
    accounts = accounts.filter(account => account.id !== this.props.account.id)
    this.setState({ accounts })
  }

  async send(_data) {
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
        tag: 'PEGASUS',
        address: this.state.dstAddress,
        value: _data.value ? parseInt(_data.value) : 0,
        message: asciiToTrytes(_data.message)
      }
    ]

    const { response, success } = await this.props.background.send({
      method: 'transfer',
      args: [transfer]
    })

    if (!success && response !== REQUESTED_REJECTED_BY_THE_USER) {
      this.props.setNotification({
        type: 'danger',
        text: response,
        position: 'under-bar'
      })
    } else if (success) {
      this.props.setNotification({
        type: 'success',
        text: 'Transfer was successful',
        position: 'under-bar'
      })
    }
  }

  render() {
    return (
      <div className="container">
        <div className="row">
          <div className="col-12 mt-2 mb-2">
            <IconedInput
              placeholder="Insert an IOTA address here..."
              prependIcon={
                Utils.isValidAddress(this.state.dstAddress)
                  ? 'correct'
                  : 'search'
              }
              onClickAppendIcon={() => this.setState({ dstAddress: '' })}
              appendIcon={'cancel'}
              value={this.state.dstAddress}
              id="send-search-bar"
              onChange={e => this.setState({ dstAddress: e.target.value })}
            />
          </div>
        </div>
        {!Utils.isValidAddress(this.state.dstAddress) ? (
          <div className="row mb-1">
            <div className="col-12">
              <CheckBox
                id="check-between-acc"
                text="Transfer between my accounts"
                value={this.state.isTransferingBetweenWalletAccounts}
                checked={this.state.isTransferingBetweenWalletAccounts}
                onChange={() =>
                  this.setState({
                    isTransferingBetweenWalletAccounts: !this.state
                      .isTransferingBetweenWalletAccounts
                  })
                }
              />
            </div>
          </div>
        ) : null}
        <hr className="mb-2" />
        {!Utils.isValidAddress(this.state.dstAddress) ? (
          this.state.isTransferingBetweenWalletAccounts ? (
            <SelectWalletAccount
              filter={this.state.dstAddress}
              accounts={this.state.accounts}
              network={this.props.network}
              onSelect={address => this.setState({ dstAddress: address })}
            />
          ) : (
            <div className="container-accounts">
              {this.state.recents
                .filter(value =>
                  this.state.dstAddress.length > 0
                    ? value.includes(this.state.dstAddress)
                    : true
                )
                .filter((_, index) => index < this.state.viewRecents)
                .map(address => {
                  return (
                    <React.Fragment>
                      <div className="row">
                        <div
                          className="col-12 text-dark-gray text-xxs text-left cursor-pointer"
                          onClick={() => this.setState({ dstAddress: address })}
                        >
                          {Utils.showAddress(address, 27, 18)}
                        </div>
                      </div>
                      <hr className="mb-2 mt-2" />
                    </React.Fragment>
                  )
                })}
              <div className="row mb-2">
                <div
                  onClick={() =>
                    this.setState({
                      viewRecents: this.state.viewRecents + 4
                    })
                  }
                  className={
                    'col-12 text-primary text-xs text-center ' +
                    (this.state.viewRecents >= this.state.recents.length
                      ? ''
                      : 'cursor-pointer')
                  }
                  style={{
                    opacity:
                      this.state.viewRecents >= this.state.recents.length
                        ? 0.5
                        : 1
                  }}
                >
                  View More <span className="text-xxs">(recents)</span>
                </div>
              </div>
            </div>
          )
        ) : (
          <SendOptions
            max={this.props.account.data[this.props.network.type].balance}
            onSend={this.send}
            onCancel={() => this.setState({ dstAddress: '' })}
          />
        )}
      </div>
    )
  }
}

export default Send
