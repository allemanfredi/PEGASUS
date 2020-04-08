import React from 'react'

import Input from '../../components/input/Input'

class Unlock extends React.Component {
  constructor(props, context) {
    super(props, context)

    this.unlock = this.unlock.bind(this)

    this.state = {
      shake: false,
      password: ''
    }
  }

  async unlock(e) {
    e.preventDefault()
    this.setState({ shake: false })

    const canUnlock = await this.props.background.comparePassword(
      this.state.password
    )
    if (canUnlock) {
      this.props.onUnlock(this.state.password)
    } else this.setState({ shake: true })
  }

  render() {
    return (
      <div className={this.state.shake ? ' shake' : ''}>
        <div className="row mt-3 mb-3">
          <div className="col-12 text-center text-lg text-blue text-bold">
            Insert your password to export the seed
          </div>
        </div>
        <div className="row mt-20">
          <div className="col-12">
            <form id="unlock-form" onSubmit={this.unlock}>
              <Input
                value={this.state.password}
                onChange={e => this.setState({ password: e.target.value })}
                label="password"
                id="inp-psw-unlock"
                type="password"
              />
            </form>
          </div>
        </div>
        <div className="row mt-3">
          <div className="col-12">
            <button
              disabled={!this.state.password.length > 0}
              onClick={this.unlock}
              type="submit"
              id="btn-unlock"
              className="btn btn-blue text-bold btn-big"
            >
              Unlock
            </button>
          </div>
        </div>
      </div>
    )
  }
}

export default Unlock
