import React, { Component } from 'react'
import { popupMessanger } from '@pegasus/utils/messangers'
import * as  passwordValidator from 'password-validator'
import Spinner from '../../components/spinner/Spinner'

class Init extends Component {
  constructor(props, context) {
    super(props, context)

    this.createWallet = this.createWallet.bind(this)
    this.goBack = this.goBack.bind(this)
    this.goOn = this.goOn.bind(this)
    this.updateStatusInitialization = this.updateStatusInitialization.bind(this)
    this.randomiseSeedLetter = this.randomiseSeedLetter.bind(this)
    this.copyToClipboard = this.copyToClipboard.bind(this)
    this.onChangePassword = this.onChangePassword.bind(this)
    this.onChangeRePassword = this.onChangeRePassword.bind(this)
    this.checkPassword = this.checkPassword.bind(this)
    this.getPasswordErrors = this.getPasswordErrors.bind(this)

    this.passwordValidator = new passwordValidator();
    this.passwordValidator
      .is().min(8)                                    // Minimum length 8
      .has().uppercase()                              // Must have uppercase letters
      .has().lowercase()                              // Must have lowercase letters
      .has().symbols()                                // Must have symbols 
      .has().digits()                                 // Must have numbers

    this.state = {
      psw: '',
      pswErrors: [],
      pswAcceptable: false,
      repsw: '',
      name: '',
      seed: [],
      randomLetters: 10,
      randomizedLetter: [],
      isCreatingWallet: false,
      initialization: [true, false, false, false],
      indexInitialization: 0,
      isCopiedToClipboard: false,
      selectedAvatar: 0
    }
  }

  async componentDidMount() {
    const seed = await popupMessanger.generateSeed();
    this.setState({ seed })
  }

  onChangePassword(e) {
    this.setState({ psw: e.target.value })
    this.checkPassword(e.target.value, this.state.repsw)
  }

  onChangeRePassword(e) {
    this.setState({ repsw: e.target.value })
    this.checkPassword(this.state.psw, e.target.value)
  }

  checkPassword(psw, rePsw) {

    const errors = this.getPasswordErrors(psw)
    this.setState({ pswErrors: errors })

    if (psw === rePsw && this.state.pswErrors.length === 0) {
      this.setState({ pswAcceptable: true })
    } else this.setState({ pswAcceptable: false })
  }

  getPasswordErrors(psw) {
    const err = this.passwordValidator.validate(psw, { list: true })
    const errors = err.map(error => {
      switch (error) {
        case 'min': return 'Password must contains at least 8 characters'
        case 'uppercase': return 'Password must contains at least 1 uppercase character'
        case 'lowercase': return 'Password must contains at least 1 lowercase character'
        case 'symbols': return 'Password must contains at least 1 symbol'
        case 'digits': return 'Password must contains at least 1 digit'
        default: return '';
      }
    })
    return errors;
  }

  //action = true -> goOn, action = false = goBack
  goBack() {
    this.updateStatusInitialization(this.state.indexInitialization, false)
    this.setState({ indexInitialization: this.state.indexInitialization - 1 })
  }

  async goOn() {
    this.updateStatusInitialization(this.state.indexInitialization, true);
    this.setState({ indexInitialization: this.state.indexInitialization + 1 })

    if (this.state.indexInitialization === 4) { //create wallet
      this.setState({ isCreatingWallet: true })
      await this.createWallet()
      this.setState({ isCreatingWallet: false })
      this.props.onSuccess()
    }
  }

  updateStatusInitialization(index, action) {
    this.setState(state => {
      const initialization = state.initialization
      initialization[index] = false
      action ? initialization[index + 1] = true : initialization[index - 1] = true;
      return {
        initialization,
      }
    })
  }

  async randomiseSeedLetter(index) {
    if (!this.state.randomizedLetter.includes(index) && this.state.randomLetters > 0) {
      this.setState({ randomizedLetter: [...this.state.randomizedLetter, index] })
      this.setState({ randomLetters: this.state.randomLetters - 1 })
    }

    const letter = await popupMessanger.generateSeed(1)
    this.setState(state => {
      const seed = state.seed
      seed[index] = letter[0]
      return {
        seed
      }
    })
  }

  copyToClipboard(e) {
    const seed = this.state.seed.toString().replace(/,/g, '')
    const textField = document.createElement('textarea')
    textField.innerText = seed;
    document.body.appendChild(textField)
    textField.select()
    document.execCommand('copy')
    textField.remove()
    this.setState({ isCopiedToClipboard: true })
  }

  async createWallet() {
    return new Promise(async (resolve, reject) => {
      try {
        await popupMessanger.storePassword(this.state.psw)
        await popupMessanger.setStorageKey(this.state.psw)

        const account = {
          name: this.state.name,
          avatar: this.state.selectedAvatar,
          seed: this.state.seed
        }
        await popupMessanger.addAccount(account, true)

        popupMessanger.writeOnLocalStorage()
        resolve()
      } catch (err) {
        reject('Impossible to create the wallet')
      }
    })
  }

  render() {
    return (
      <div>
        <div className="row mt-5">
          <div className='col-12 text-center'>
            <img className="border-radius-50" src='./material/logo/pegasus-128.png' height='80' width='80' alt='pegasus logo' />
          </div>
        </div>
        {
          this.state.isCreatingWallet 
            ? <React.Fragment>
                <div className="container">
                  <div className='row mt-5 mb-3'>
                    <div className='col-12 text-center text-lg text-blue'>I'm creating the wallet!</div>
                  </div>
                  <div className='row mt-4'>
                    <div className="col-12 text-center">
                      <Spinner size={'big'}/>
                    </div>
                  </div>
                </div>
              </React.Fragment>
            : <React.Fragment>
              {
                this.state.initialization[0] 
                  ? <div className="container">
                      <div className='row mt-3 mb-3'>
                        <div className='col-12 text-center text-lg text-blue'>Let's add a name</div>
                      </div>
                      <div className='row mt-11'>
                        <div className='col-12'>
                          <label htmlFor='inp-name' className='inp'>
                            <input value={this.state.name} onChange={e => { this.setState({ name: e.target.value }); }} type='text' id='inp-name' placeholder='&nbsp;' />
                            <span className='label'>name</span>
                            <span className='border'></span>
                          </label>
                        </div>
                      </div>
                    </div>
                  : ''
              }
              {
                this.state.initialization[1] 
                  ? <div className="container">
                      <div className='row mt-3'>
                        <div className='col-12 text-center text-lg text-blue'>
                          Let's add a password
                        </div>
                      </div>
                      <div className='row mt-5'>
                        <div className='col-12'>
                          <label htmlFor='inp-password' className='inp'>
                            <input value={this.state.psw} onChange={this.onChangePassword} type='password' id='inp-password' placeholder='&nbsp;' />
                            <span className='label'>password</span>
                            <span className='border'></span>
                          </label>
                        </div>
                      </div>
                      <div className='row mt-3 mb-3'>
                        <div className='col-12'>
                          <label htmlFor='inp-re-password' className='inp'>
                            <input value={this.state.repsw} onChange={this.onChangeRePassword} type='password' id='inp-re-password' placeholder='&nbsp;' />
                            <span className='label'>re-password</span>
                            <span className='border'></span>
                          </label>
                        </div>
                      </div>
                      {
                        this.state.pswErrors.map(error => {
                          return (
                            <div className='row mt-1'>
                              <div className='col-12 text-center text-red text-xxs'>{error}</div>
                            </div>
                          )
                        })
                      }
                    </div>
                  : ''
                }
                {
                  this.state.initialization[2] 
                    ? <div className="container">
                        <div className='row mt-2'>
                          <div className='col-12 text-center text-lg text-blue'>
                            Let's generate a seed
                          </div>
                        </div>
                        <div className='row mb-2 mt-1'>
                          <div className='col-12 text-center'>
                            Press <i className='text-blue text-bold'>
                            {this.state.randomLetters >= 0 ? this.state.randomLetters : 0}</i> more letters to randomise them
                          </div>
                        </div>
                        {
                          [0, 9, 18, 27, 36, 45, 54, 63, 72].map(item => {
                            return (
                              <div className='row pl-3'>
                                <div className='col-1'></div>
                                {Array.from(new Array(9), (x, i) => i + item).map(index => {
                                  return (
                                    <div className='col-1'>
                                      <div onClick={() => this.randomiseSeedLetter(index)} className='container-letter'>{this.state.seed[index]}</div>
                                    </div>
                                  );
                                })}
                                <div className='col-1'></div>
                              </div>
                            );
                          })
                        }
                      </div>
                  : ''
              }
              {
                this.state.initialization[3]
                  ? <div className="container">
                      <div className='row mt-3'>
                        <div className='col-12 text-center text-lg text-blue'>
                          Choose your avatar!
                        </div>
                      </div>
                      <div className='row mt-1'>
                        <div className='col-12 text-center text-sm text-gray'>
                          (click on the image you want to select)
                        </div>
                      </div>
                      <div className="row mt-6">
                        <div className='col-4 text-center cursor-pointer'
                          onClick={() => this.setState({selectedAvatar: 1})}>
                          <img className={this.state.selectedAvatar === 1 ? 'border-darkblue border-radius-50' : ''} 
                            src="./material/profiles/1.svg" height="70" width="70"/>
                        </div>
                        <div className='col-4 text-center cursor-pointer'
                          onClick={() => this.setState({selectedAvatar: 2})}>
                          <img className={this.state.selectedAvatar === 2 ? 'border-darkblue border-radius-50' : ''} 
                            src="./material/profiles/2.svg" height="70" width="70"/>
                        </div>
                        <div className='col-4 text-center cursor-pointer'
                          onClick={() => this.setState({selectedAvatar: 3})}>
                          <img className={this.state.selectedAvatar === 3 ? 'border-darkblue border-radius-50' : ''} 
                            src="./material/profiles/3.svg" height="70" width="70"/>
                        </div>
                      </div>
                      <div className="row mt-4">
                        <div className='col-4 text-center cursor-pointer'
                          onClick={() => this.setState({selectedAvatar: 4})}>
                          <img className={this.state.selectedAvatar === 4 ? 'border-darkblue border-radius-50' : ''} 
                            src="./material/profiles/4.svg" height="70" width="70"/>
                        </div>
                        <div className='col-4 text-center cursor-pointer'
                          onClick={() => this.setState({selectedAvatar: 5})}>
                          <img className={this.state.selectedAvatar === 5 ? 'border-darkblue border-radius-50' : ''} 
                            src="./material/profiles/5.svg" height="70" width="70"/>
                        </div>
                        <div className='col-4 text-center cursor-pointer'
                          onClick={() => this.setState({selectedAvatar: 6})}>
                          <img className={this.state.selectedAvatar === 6 ? 'border-darkblue border-radius-50' : ''} 
                            src="./material/profiles/6.svg" height="70" width="70"/>
                        </div>
                      </div>
                    </div>
                  : ''
              }
              {
                this.state.initialization[4] ?
                  <div className="container">
                    <div className='row mt-3 mb-3'>
                      <div className='col-12 text-center text-lg text-blue'>Let's export the seed</div>
                    </div>
                    <div className='row mt-4'>
                      <div className='col-12 text-center text-bold'>Take care to copy the seed in order to correctly reinitialize the wallet </div>
                    </div>
                    <div className='row mt-5'>
                      <div className='col-1'></div>
                      <div className='col-10 text-center text-xs break-text border-light-gray pt-1 pb-1'>
                        {this.state.seed.toString().replace(/,/g, '')}
                      </div>
                      <div className='col-1'></div>
                    </div>
                    <div className='row mt-5'>
                      <div className='col-12 text-center'>
                        <button onClick={this.copyToClipboard} className='btn btn-blue text-bold btn-big'>
                          <span className='fa fa-clipboard'></span> Copy to clipboard
                        </button>
                      </div>
                    </div>
                  </div>
                  : ''
              }
              <div className='container-menu-init'>
                <div className='row'>
                  <div className='col-6 text-center pl-0 pr-0'>
                    <button disabled={this.state.initialization[0] ? true : false} onClick={this.goBack}
                      type='submit'
                      className='btn btn-light-blue text-bold no-border   '><span className='fa fa-arrow-left'></span></button>
                  </div>
                  <div className='col-6 text-center pl-0 pr-0'>
                    <button disabled={
                      this.state.initialization[0] ? (this.state.name.length > 0 ? false : true) :
                      this.state.initialization[1] ? (this.state.pswAcceptable ? false : true) :
                      this.state.initialization[2] ? (this.state.randomLetters === 0 ? false : true) : 
                      this.state.initialization[3] ? (this.state.selectedAvatar === 0 ? true : false) : ''}
                      onClick={this.goOn}
                      type='submit'
                      className='btn btn-blue text-bold no-border'
                    ><span className='fa fa-arrow-right'></span>
                    </button>
                  </div>
                </div>
              </div>
            </React.Fragment>
        }
      </div>
    );
  }
}

export default Init;
