import React, { Component } from 'react'
import Alert from '../../components/alert/Alert'
import { popupMessanger } from '@pegasus/utils/messangers'
import Spinner from '../../components/spinner/Spinner'

class Add extends Component {
  constructor(props, context) {
    super(props, context);

    this.goBack = this.goBack.bind(this)
    this.goOn = this.goOn.bind(this)
    this.updateStatusInitialization = this.updateStatusInitialization.bind(this)
    this.randomiseSeedLetter = this.randomiseSeedLetter.bind(this)
    this.copyToClipboard = this.copyToClipboard.bind(this)
    this.onCloseAlert = this.onCloseAlert.bind(this)

    this.state = {
      name: '',
      seed: [],
      randomLetters: 10,
      randomizedLetter: [],
      isLoading: false,
      initialization: [true, false, false],
      indexInitialization: 0,
      showAlert: false,
      alertType: '',
      alertText: '',
      selectedAvatar: 0
    }
  }

  async componentDidMount() {
    const seed = await popupMessanger.generateSeed();
    this.setState({ seed })
  }

  goBack() {
    this.updateStatusInitialization(this.state.indexInitialization, false)
    this.setState({ indexInitialization: this.state.indexInitialization - 1 })
  }

  async goOn() {
    if (this.state.indexInitialization === 0) {
      const nameAlreadyExixts = await popupMessanger.isAccountNameAlreadyExists(this.state.name)
      if (nameAlreadyExixts) {
        this.setState({
          showAlert: true,
          alertText: 'Account name already exists',
          alertType: 'error'
        })
        return
      }
    }
    this.updateStatusInitialization(this.state.indexInitialization, true)
    this.setState({ indexInitialization: this.state.indexInitialization + 1 })
    if (this.state.indexInitialization === 3) {
      this.setState({ isLoading: true })
      
      const account = {
        name: this.state.name,
        avatar: this.state.selectedAvatar,
        seed: this.state.seed
      }
      await popupMessanger.addAccount(account, true)
      await popupMessanger.writeOnLocalStorage()
      this.setState({ isLoading: false })
      this.props.onBack()
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

  onCloseAlert() {
    this.setState({
      showAlert: false
    })
  }

  render() {
    return (
      <React.Fragment>
        {
          this.state.showAlert
            ? <Alert type={this.state.alertType}
              text={this.state.alertText}
              onClose={this.onCloseAlert}
            />
            : ''
        }
        {
          this.state.isLoading
            ? <React.Fragment>
              <div className="container">
                <div className='row mt-5 mb-3'>
                  <div className='col-12 text-center text-lg text-blue'>I'm creating the new Account!</div>
                </div>
                <div className='row mt-4'>
                  <div className="col-12 text-center">
                    <Spinner size={'big'} />
                  </div>
                </div>
              </div>
            </React.Fragment>
            :
            <React.Fragment>
              {
                this.state.initialization[0]
                  ? <div className="container">
                    <div className='row mt-5 mb-3'>
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
                    <div className='row mt-2'>
                      <div className='col-12 text-center text-lg text-blue'>
                        Let's generate a seed
                      </div>
                    </div>
                    <div className='row mb-2 mt-1'>
                      <div className='col-12 text-center'>
                        Press <i className='text-blue text-bold'>{this.state.randomLetters >= 0 ? this.state.randomLetters : 0}</i> more letters to randomise them
                      </div>
                    </div>
                    {
                      [0, 9, 18, 27, 36, 45, 54, 63, 72].map(item => {
                        return (
                          <div className='row pl-3'>
                            <div className='col-1'></div>
                            {
                              Array.from(new Array(9), (x, i) => i + item).map(index => {
                                return (
                                  <div className='col-1'>
                                    <div onClick={() => this.randomiseSeedLetter(index)} className='container-letter'>{this.state.seed[index]}</div>
                                  </div>
                                )
                              })
                            }
                            <div className='col-1'></div>
                          </div>
                        );
                      })
                    }
                  </div>
                  : ''
              }
              {
                this.state.initialization[2]
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
                      <div className="overflow-auto-250h mt-6">
                        <div className='row'>
                          {
                            [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15].map(number => {
                              return (
                                <div className={(number > 3 ? 'mt-4' : '') + ' col-4 text-center cursor-pointer'}
                                  onClick={() => this.setState({ selectedAvatar: number })}>
                                  <img className={this.state.selectedAvatar === number ? 'border-darkblue border-radius-50' : ''}
                                    src={`./material/profiles/${number}.svg`} height="60" width="60" />
                                </div>
                              )
                            })
                          }
                        </div>
                      </div>
                    </div>
                  : ''
              }
              {
                this.state.initialization[3]
                  ? <div className="container">
                    <div className='row mt-3 mb-3'>
                      <div className='col-12 text-center text-lg text-blue'>Let's export the seed</div>
                    </div>
                    <div className='row mt-4'>
                      <div className='col-12 text-center text-bold'>Take care to copy the seed in order to correctly reinitialize the wallet </div>
                    </div>
                    <div className='row mt-5'>
                      <div className='col-1'></div>
                      <div className='col-10 text-center text-no-overflow text-xxs'>
                        {this.state.seed.toString().replace(/,/g, '')}
                      </div>
                      <div className='col-1'></div>
                    </div>
                    <div className='row mt-6'>
                      <div className='col-12 text-center'>
                        <button onClick={this.copyToClipboard}
                          className='btn btn-blue text-bold btn-big'>
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
                    <button disabled={this.state.initialization[0] ? true : false}
                      onClick={this.goBack} type='submit'
                      className='btn btn-light-blue text-bold no-border'>
                      <span className='fa fa-arrow-left'></span>
                    </button>
                  </div>
                  <div className='col-6 text-center pl-0 pr-0'>
                    <button disabled={
                      this.state.initialization[0] ? (this.state.name.length > 0 ? false : true) :
                      this.state.initialization[1] ? (this.state.randomLetters === 0 ? false : true) : 
                      this.state.initialization[2] ? (this.state.selectedAvatar === 0 ? true : false) :  ''}
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
      </React.Fragment>
    )
  }
}

export default Add