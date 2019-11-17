import React, { Component } from 'react'
import { popupMessanger } from '@pegasus/utils/messangers'


class Login extends Component {
  constructor(props, context) {
    super(props, context)

    this.clickLogin = this.clickLogin.bind(this)

    this.state = {
      psw: '',
      error: '',
      shake: false
    }
  }

  async clickLogin(e) {
    e.preventDefault()

    this.setState({ shake: false })

    const canAccess = await popupMessanger.comparePassword(this.state.psw)
    if (canAccess) {
      await popupMessanger.setPassword(this.state.psw)
      await popupMessanger.setStorageKey(this.state.psw)
      await popupMessanger.unlockWallet(this.state.psw)
      await popupMessanger.startSession()
      this.props.onSuccess()
    } else {
      this.setState({ shake: true })
    }
  }

  render() {
    return (
      <div className={this.state.shake ? 'container shake' : 'container'}>
        <div className='container-logo-login mt-5'>
          <img className="border-radius-50" src='./material/logo/pegasus-256.png' height='130' width='130' alt='pegasus logo'/>
        </div>
        <div className='row mt-1'>
          <div className='col-12 text-center text-xl text-blue text-bold'>
            Pegasus
          </div>
        </div>
        <div className="row">
          <div className="col-12 text-gray text-sm text-center">
            Meet 'the Tangle' from your browser!
          </div>
        </div>
        <div className='row mt-7'>
          <div className='col-12'>
            <form onSubmit={this.clickLogin}>
              <label htmlFor='inp-psw ' className='inp'>
                <input onChange={e => this.setState({ psw: e.target.value })} type='password' id='inp-psw' placeholder='&nbsp;' />
                <span className='label'>password</span>
                <span className='border'></span>
              </label>
            </form>
          </div>
        </div>
        <div className='row mt-3'>
          <div className='col-12 text-center'>
            <button disabled={!this.state.psw.length > 0} onClick={this.clickLogin} type='submit' className='btn btn-blue text-bold btn-big'>Login</button>
          </div>
        </div>
        <div className='row mt-1'>
          <div className='col-12 text-center'>
            <button onClick={e => { this.props.onRestore() }} type='submit' className='btn btn-white '>Restore from seed</button>
          </div>
        </div>
      </div>
    )
  }
}

export default Login