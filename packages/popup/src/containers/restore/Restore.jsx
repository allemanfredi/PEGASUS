import React, { Component } from 'react'
import IOTA from '@pegasus/utils/iota'
import { popupMessanger } from '@pegasus/utils/messangers'
import Loader from '../../components/loader/Loader'
import { composeAPI } from '@iota/core'

class Restore extends Component {
  constructor(props, context) {
    super(props, context)

    this.onClickRestore = this.onClickRestore.bind(this)
    this.comparePassword = this.comparePassword.bind(this)
    this.closeAlert = this.closeAlert.bind(this)
    this.onChangeSeed = this.onChangeSeed.bind(this)

    this.state = {
      seed: '',
      psw: '',
      accountName: '',
      isLoading: false,
      seedIsValid: false,
      passwordIsValid: false,
      shake: false
    }
  }

  async onClickRestore(e) {
    e.preventDefault()

    const isSeedValid = await popupMessanger.isSeedValid(this.state.seed)
    if (!isSeedValid) {
      this.props.setNotification({
        type: 'danger',
        text: 'Invalid Seed',
        position: 'under-bar'
      })
      return
    }

    this.setState({ isLoading: true })

    await popupMessanger.resetData()

    const data = await IOTA.getAccountData(this.state.seed)
    const account = {
      name: this.state.accountName,
      seed: this.state.seed,
      data,
      network: this.props.network
    }
    const isRestored = await popupMessanger.restoreWallet(
      account,
      this.props.network,
      this.state.psw
    )

    if (!isRestored) {
      this.setState({ isLoading: false })
      this.props.setNotification({
        type: 'danger',
        text: 'Error during restoring the wallet! Try Again!'
      })
      return
    }
    
    this.props.onSuccess()
  }

  async comparePassword(e) {
    e.preventDefault()

    this.setState({ shake: false })

    const canAccess = await popupMessanger.comparePassword(this.state.psw)
    if (canAccess) this.setState({ passwordIsValid: true })
    else this.setState({ shake: true })
  }

  onChangeSeed(e) {
    this.setState({ seed: e.target.value })
  }

  closeAlert() {
    this.props.setError(null)
  }

  render() {
    return this.state.isLoading ? (
      <Loader />
    ) : (
      <div className={this.state.shake ? 'container shake' : 'container'}>
        <div className="row mt-3 mb-3">
          <div className="col-12 text-center text-lg text-blue text-bold">
            {!this.state.passwordIsValid
              ? 'Insert your password to restore the wallet'
              : 'Now choose a name and insert the seed'}
          </div>
        </div>
        {this.state.passwordIsValid ? (
          <React.Fragment>
            <div className="row mt-8">
              <div className="col-12 text-xs text-gray">seed</div>
            </div>
            <div className="row mt-05">
              <div className="col-12 text-center">
                <textarea
                  rows={3}
                  value={this.state.seed}
                  onChange={this.onChangeSeed}
                />
              </div>
            </div>
            <div className="row mt-2">
              <div className="col-12 text-center">
                <form onSubmit={this.onClickRestore}>
                  <label htmlFor="inp-name" className="inp ">
                    <input
                      value={this.state.accountName}
                      onChange={e => {
                        this.setState({ accountName: e.target.value })
                      }}
                      type="text"
                      id="inp-name"
                      placeholder="&nbsp;"
                    />
                    <span className="label">account name</span>
                    <span className="border"></span>
                  </label>
                </form>
              </div>
            </div>
            <div className="row mt-4">
              <div className="col-12 text-center">
                <button
                  disabled={
                    this.state.seed.length > 0 &&
                    this.state.accountName.length > 0
                      ? false
                      : true
                  }
                  onClick={this.onClickRestore}
                  type="button"
                  className="btn btn-blue text-bold btn-big"
                >
                  Restore
                </button>
              </div>
            </div>
          </React.Fragment>
        ) : (
          <React.Fragment>
            <div className="row mt-22">
              <div className="col-12 text-center">
                <form onSubmit={this.comparePassword}>
                  <label htmlFor="inp-psw" className="inp">
                    <input
                      value={this.state.psw}
                      onChange={e => this.setState({ psw: e.target.value })}
                      type="password"
                      id="inp-psw"
                      placeholder="&nbsp;"
                    />
                    <span className="label">password</span>
                    <span className="border"></span>
                  </label>
                </form>
              </div>
            </div>
            <div className="row mt-3">
              <div className="col-12 text-center">
                <button
                  disabled={this.state.psw.length > 0 ? false : true}
                  onClick={this.comparePassword}
                  type="button"
                  className="btn btn-blue text-bold btn-big"
                >
                  Unlock
                </button>
              </div>
            </div>
          </React.Fragment>
        )}
        <div className="row mt-1">
          <div className="col-12 text-center">
            <button
              onClick={() => this.props.onBack()}
              type="submit"
              className="btn btn-white"
            >
              return to login
            </button>
          </div>
        </div>
      </div>
    )
  }
}

export default Restore
