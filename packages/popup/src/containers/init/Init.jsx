import React, { Component } from 'react'
import * as passwordValidator from 'password-validator'
import Spinner from '../../components/spinner/Spinner'
import Welcome from './welcome/Welcome'
import Name from './name/Name'
import Password from './password/Password'
import GenerateSeed from './generateSeed/GenerateSeed'
import Avatar from './avatar/Avatar'
import Export from './export/Export'
import ImportSeed from './importSeed/ImportSeed'
import Utils from '@pegasus/utils/utils'

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
    this.onChangeSeedFromImport = this.onChangeSeedFromImport.bind(this)

    this.passwordValidator = new passwordValidator()
    this.passwordValidator
      .is()
      .min(8) // Minimum length 8
      .has()
      .uppercase() // Must have uppercase letters
      .has()
      .lowercase() // Must have lowercase letters
      .has()
      .symbols() // Must have symbols
      .has()
      .digits() // Must have numbers

    this.state = {
      psw: '',
      pswErrors: [],
      pswAcceptable: false,
      repsw: '',
      name: '',
      seed: [],
      seedError: null,
      randomLetters: 10,
      randomizedLetter: [],
      isCreatingWallet: false,
      initialization: [true, false, false, false],
      indexInitialization: 0,
      selectedAvatar: 0,
      mode: 'new'
    }
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
        case 'min':
          return 'Password must contains at least 8 characters'
        case 'uppercase':
          return 'Password must contains at least 1 uppercase character'
        case 'lowercase':
          return 'Password must contains at least 1 lowercase character'
        case 'symbols':
          return 'Password must contains at least 1 symbol'
        case 'digits':
          return 'Password must contains at least 1 digit'
        default:
          return ''
      }
    })
    return errors
  }

  //action = true -> goOn, action = false = goBack
  goBack() {
    if (this.state.indexInitialization === 1) {
      this.setState({
        psw: '',
        pswErrors: [],
        pswAcceptable: false,
        repsw: '',
        name: '',
        seed: [],
        seedError: null,
        randomLetters: 10,
        randomizedLetter: [],
        isCreatingWallet: false,
        selectedAvatar: 0,
        mode: 'new'
      })
    }

    this.updateStatusInitialization(this.state.indexInitialization, false)
    this.setState({ indexInitialization: this.state.indexInitialization - 1 })
  }

  async goOn() {
    this.updateStatusInitialization(this.state.indexInitialization, true)
    this.setState({ indexInitialization: this.state.indexInitialization + 1 })

    if (this.state.indexInitialization === 2 && this.state.mode === 'new') {
      const seed = await this.props.background.generateSeed()
      this.setState({ seed })
    }

    if (
      (this.state.indexInitialization === 5 && this.state.mode === 'new') ||
      (this.state.indexInitialization === 4 && this.state.mode === 'import')
    ) {
      //create wallet
      this.setState({ isCreatingWallet: true })

      const isCreated = await this.createWallet()

      if (isCreated) {
        this.props.onSuccess()
      } else {
        this.goBack()
        this.props.setNotification({
          type: 'danger',
          text: 'Error during creating the wallet! Try Again!'
        })
      }

      this.setState({ isCreatingWallet: false })
    }
  }

  updateStatusInitialization(index, action) {
    this.setState(state => {
      const initialization = state.initialization
      initialization[index] = false
      action
        ? (initialization[index + 1] = true)
        : (initialization[index - 1] = true)
      return {
        initialization
      }
    })
  }

  async randomiseSeedLetter(index) {
    if (
      !this.state.randomizedLetter.includes(index) &&
      this.state.randomLetters > 0
    ) {
      this.setState({
        randomizedLetter: [...this.state.randomizedLetter, index]
      })
      this.setState({ randomLetters: this.state.randomLetters - 1 })
    }

    const letter = await this.props.background.generateSeed(1)
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
    textField.innerText = seed
    document.body.appendChild(textField)
    textField.select()
    document.execCommand('copy')
    textField.remove()

    this.props.setNotification({
      type: 'success',
      text: 'Copied!'
    })
  }

  async createWallet() {
    try {
      let seed = this.state.seed
      if (!Array.isArray(seed)) seed = seed.split()

      const account = {
        name: this.state.name,
        avatar: this.state.selectedAvatar,
        seed
      }

      const isAdded = await this.props.background.initWallet(
        this.state.psw,
        account
      )
      if (!isAdded) return false

      return true
    } catch (err) {
      return false
    }
  }

  onChangeSeedFromImport(seed) {
    this.setState({ seed })

    const isValidSeed = Utils.isValidSeed(seed)
    if (!isValidSeed) {
      this.setState({
        seedError: 'Invalid seed'
      })
      return
    }

    //enable go on
    else
      this.setState({
        randomLetters: 0,
        seedError: null
      })
  }

  render() {
    return (
      <React.Fragment>
        {this.state.indexInitialization > 0 ? (
          <div className="row mt-5">
            <div className="col-12 text-center">
              <img
                className="border-radius-50"
                src="./material/logo/pegasus-128.png"
                height="80"
                width="80"
                alt="pegasus logo"
              />
            </div>
          </div>
        ) : (
          ''
        )}
        {this.state.isCreatingWallet ? (
          <React.Fragment>
            <div className="container">
              <div className="row mt-5 mb-3">
                <div className="col-12 text-center text-lg text-blue text-bold">
                  I'm creating the wallet!
                </div>
              </div>
              <div className="row mt-4">
                <div className="col-12 text-center">
                  <Spinner size={'big'} />
                </div>
              </div>
            </div>
          </React.Fragment>
        ) : (
          <React.Fragment>
            {this.state.initialization[0] ? (
              <Welcome
                onModeSelected={mode => {
                  this.setState({ mode })
                  this.goOn()
                }}
              />
            ) : (
              ''
            )}
            {this.state.initialization[1] ? (
              <Name
                value={this.state.name}
                onChange={e => {
                  this.setState({ name: e.target.value })
                }}
              />
            ) : (
              ''
            )}
            {this.state.initialization[2] ? (
              <Password
                password={this.state.psw}
                repassword={this.state.repsw}
                onChangePassword={this.onChangePassword}
                onChangeRePassword={this.onChangeRePassword}
                errors={this.state.pswErrors}
              />
            ) : (
              ''
            )}
            {this.state.initialization[3] && this.state.mode === 'new' ? (
              <GenerateSeed
                randomLetters={this.state.randomLetters}
                onLetterClick={index => this.randomiseSeedLetter(index)}
                seed={this.state.seed}
              />
            ) : (
              ''
            )}
            {this.state.initialization[3] && this.state.mode === 'import' ? (
              <ImportSeed
                seed={this.state.seed}
                error={this.state.seedError}
                onChangeSeed={this.onChangeSeedFromImport}
              />
            ) : (
              ''
            )}
            {this.state.initialization[4] ? (
              <Avatar
                selectedAvatar={this.state.selectedAvatar}
                onAvatarClick={number =>
                  this.setState({ selectedAvatar: number })
                }
              />
            ) : (
              ''
            )}
            {this.state.initialization[5] && this.state.mode === 'new' ? (
              <Export
                setNotification={this.props.setNotification}
                seed={this.state.seed}
                onCopyToClipboard={this.copyToClipboard}
              />
            ) : (
              ''
            )}
            {this.state.indexInitialization > 0 ? (
              <div className="container-menu-init">
                <div className="row">
                  <div className="col-6 text-center pl-0 pr-0">
                    <button
                      disabled={this.state.initialization[0] ? true : false}
                      onClick={this.goBack}
                      type="submit"
                      className="btn btn-light-blue text-bold no-border"
                    >
                      <span className="fa fa-arrow-left"></span>
                    </button>
                  </div>
                  <div className="col-6 text-center pl-0 pr-0">
                    <button
                      disabled={
                        this.state.initialization[1]
                          ? this.state.name.length > 0
                            ? false
                            : true
                          : this.state.initialization[2]
                          ? this.state.pswAcceptable
                            ? false
                            : true
                          : this.state.initialization[3]
                          ? this.state.randomLetters === 0
                            ? false
                            : true
                          : this.state.initialization[4]
                          ? this.state.selectedAvatar === 0
                            ? true
                            : false
                          : ''
                      }
                      onClick={this.goOn}
                      type="submit"
                      className="btn btn-blue text-bold no-border"
                    >
                      <span className="fa fa-arrow-right"></span>
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              ''
            )}
          </React.Fragment>
        )}
      </React.Fragment>
    )
  }
}

export default Init
