import React from 'react'
import { popupMessanger } from '@pegasus/utils/messangers'
import Utils from '@pegasus/utils/utils'

class AccountSelection extends React.Component {
  constructor(props, context) {
    super(props, context)

    this.loadAccounts = this.loadAccounts.bind(this)
    this.switchAccount = this.switchAccount.bind(this)
    this.handleClickOutside = this.handleClickOutside.bind(this)

    this.state = {
      isClosing: false,
      accounts: []
    }
  }

  componentWillMount() {
    this.loadAccounts()
  }

  componentDidMount() {
    document.addEventListener('mousedown', this.handleClickOutside)
  }

  componentWillUnmount() {
    document.removeEventListener('mousedown', this.handleClickOutside)
  }

  handleClickOutside(event) {
    if (this.ref && !this.ref.contains(event.target)) {
      this.setState({
        isClosing: true
      })
      setTimeout(() => {
        this.props.onClose()
      }, 250)
    }
  }

  async switchAccount(newAccount) {
    let accounts = await popupMessanger.getAllAccounts()
    accounts = accounts.filter(account => account.id !== newAccount.id)
    this.setState({ accounts })
    popupMessanger.setCurrentAccount(newAccount)
  }

  async loadAccounts() {
    let accounts = await popupMessanger.getAllAccounts()
    accounts = accounts.filter(account => !account.current)
    this.setState({ accounts })
  }

  render() {
    return (
      <div
        ref={ref => (this.ref = ref)}
        className={
          'container-accounts-selection ' +
          (this.state.isClosing ? 'disappear' : '')
        }
      >
        {this.state.accounts.map(account => {
          return (
            <div
              className="row mt-1 cursor-pointer"
              onClick={() => this.switchAccount(account)}
            >
              <div className="col-2 my-auto">
                <img
                  className="border-radius-50 cursor-pointer"
                  src={`./material/profiles/${
                    account.avatar ? account.avatar : 1
                  }.svg`}
                  height="40"
                  width="40"
                  alt={`avatar logo ${account.name}`}
                />
              </div>
              <div className="col-5 my-auto">
                <div className="row">
                  <div className="col-12 text-xs text-white font-weight-bold">
                    {account.name}
                  </div>
                  <div className="col-12 text-xxxs text-white">
                    {Utils.showAddress(
                      Utils.checksummed(account.data.latestAddress),
                      8,
                      14
                    )}
                  </div>
                </div>
              </div>
              <div className="col-5 my-auto text-white font-weight-bold text-right text-md">
                {Utils.iotaReducer(
                  account.data.balance[this.props.network.type]
                    ? account.data.balance[this.props.network.type]
                    : 0
                )}
              </div>
            </div>
          )
        })}
      </div>
    )
  }
}

export default AccountSelection
