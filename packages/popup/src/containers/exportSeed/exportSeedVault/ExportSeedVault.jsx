import React, { Component } from 'react'
import Input from '../../../components/input/Input'
import Unlock from '../../unlock/Unlock'

class ExportSeedVault extends Component {
  constructor(props, context) {
    super(props, context)

    this.exportSeedVault = this.exportSeedVault.bind(this)
    this.unlock = this.unlock.bind(this)

    this.state = {
      psw: '',
      repsw: '',
      canExport: false
    }
  }

  async exportSeedVault() {
    if (
      this.state.psw.length === 0 ||
      this.state.repsw.length === 0 ||
      this.state.psw !== this.state.repsw ||
      this.state.psw.length < 8
    )
      return

    await this.props.background.createSeedVault(this.state.psw)
  }

  unlock() {}

  render() {
    return (
      <React.Fragment>
        {!this.state.canExport ? (
          <Unlock onUnlock={() => this.setState({ canExport: true })} />
        ) : (
          <div className="container">
            <div className="row mt-3 mb-3">
              <div className="col-12 text-center text-lg text-blue text-bold">
                Choose a password to protect you Vault
              </div>
            </div>
            <div className="row mt-1">
              <div className="col-12 text-center text-sm text-gray text-bold">
                (Password must be bigger than 8 characters)
              </div>
            </div>
            <div className="row mt-9">
              <div className="col-12">
                <form onSubmit={this.exportSeedVault}>
                  <Input
                    value={this.state.psw}
                    onChange={e => this.setState({ psw: e.target.value })}
                    label="password"
                    type="password"
                    id="inp-psw"
                  />

                  <div className="mt-2"></div>

                  <Input
                    value={this.state.repsw}
                    onChange={e => this.setState({ repsw: e.target.value })}
                    label="re-password"
                    type="password"
                    id="inp-psw"
                  />
                </form>
              </div>
            </div>
            <div className="row mt-3">
              <div className="col-12">
                <button
                  disabled={
                    this.state.psw.length === 0 ||
                    this.state.repsw.length === 0 ||
                    this.state.psw !== this.state.repsw ||
                    this.state.psw.length < 8
                  }
                  onClick={this.exportSeedVault}
                  type="submit"
                  className="btn btn-blue text-bold btn-big"
                >
                  Download
                </button>
              </div>
            </div>
          </div>
        )}
      </React.Fragment>
    )
  }
}

export default ExportSeedVault
