import React, { Component } from 'react'
import Utils from '@pegasus/utils/utils'
import OutlinedInput from '../../components/outlinedInput/OutlinedInput'
import Picklist from '../../components/picklist/Picklist'
import IconedInput from '../../components/iconedInput/IconedInput'
import CheckBox from '../../components/checkbox/Checkbox'
import SelectWalletAccount from './selectWalletAccounts/SelectWalletAccounts'

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
      accounts: []
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
      <div className="container">
        <div className="row">
          <div className="col-12 mt-2 mb-2">
            <IconedInput
              placeholder="Address"
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
              accounts={this.state.accounts}
              network={this.props.network}
              onSelect={address => this.setState({ dstAddress: address })}
            />
          ) : null
        ) : null}
      </div>
    )
  }
}

export default Send
