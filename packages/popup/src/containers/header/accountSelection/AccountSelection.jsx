import React from 'react'
import Utils from '@pegasus/utils/utils'
import { APP_STATE } from '@pegasus/utils/states'

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

  async componentWillMount() {
    this.loadAccounts()
    this.props.background.on('update', backgroundState => {
      if (backgroundState.state > APP_STATE.WALLET_LOCKED && accounts.all) {
        this.setState({
          accounts: backgroundState.accounts.all.filter(
            account => account.id !== this.props.account.id
          )
        })
      }
    })
  }

  async switchAccount(newAccount) {
    await this.props.background.setCurrentAccount(newAccount)
  }

  async loadAccounts() {
    let accounts = await this.props.background.getAllAccounts()
    accounts = accounts.filter(account => account.id !== this.props.account.id)
    this.setState({ accounts })
  }

  render() {
    return this.state.accounts.length > 0 ? (
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
    ) : null
  }
}

export default AccountSelection
