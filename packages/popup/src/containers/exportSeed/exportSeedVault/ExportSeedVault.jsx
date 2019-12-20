import React, { Component } from 'react'
import { popupMessanger } from '@pegasus/utils/messangers'

class ExportSeedVault extends Component {

  constructor(props, context) {
    super(props, context)

    this.exportSeedVault = this.exportSeedVault.bind(this)

    this.state = {
      psw: '',
      repsw: ''
    }
  }

  async exportSeedVault() {
    if (
      this.state.psw.length === 0 ||
      this.state.repsw.length === 0 ||
      this.state.psw !== this.state.repsw ||
      this.state.psw.length < 8
    ) return

    await popupMessanger.createSeedVault(this.state.psw)
  }

  render() {
    return (
      <div className='container'>
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
              <label htmlFor="inp-psw" className="inp">
                <input value={this.state.psw}
                  onChange={e => this.setState({ psw: e.target.value })}
                  type="password"
                  id="inp-psw" placeholder='&nbsp;' />
                <span className="label">password</span>
                <span className="border"></span>
              </label>
              <label htmlFor="inp-psw" className="inp mt-2">
                <input value={this.state.repsw}
                  onChange={e => this.setState({ repsw: e.target.value })}
                  type="password"
                  id="inp-psw" placeholder='&nbsp;' />
                <span className="label">re-password</span>
                <span className="border"></span>
              </label>
            </form>
          </div>
        </div>
        <div className="row mt-3">
          <div className="col-12">
            <button disabled={
                this.state.psw.length === 0 ||
                this.state.repsw.length === 0 ||
                this.state.psw !== this.state.repsw ||
                this.state.psw.length < 8
              }
              onClick={this.exportSeedVault}
              type="submit"
              className="btn btn-blue text-bold btn-big">
              Download
            </button>
          </div>
        </div>
      </div>
    )
  }
}

export default ExportSeedVault