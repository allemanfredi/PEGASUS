import React, { Component } from 'react'
import Alert from '../../components/alert/Alert'
import { popupMessanger } from '@pegasus/utils/messangers'
import Spinner from '../../components/spinner/Spinner'
import Name from '../init/name/Name'
import GenerateSeed from '../init/generateSeed/GenerateSeed'
import Avatar from '../init/avatar/Avatar'
import Export from '../init/export/Export'

class Add extends Component {
  constructor(props, context) {
    super(props, context)

    this.goBack = this.goBack.bind(this)
    this.goOn = this.goOn.bind(this)
    this.updateStatusInitialization = this.updateStatusInitialization.bind(this)
    this.randomiseSeedLetter = this.randomiseSeedLetter.bind(this)
    this.copyToClipboard = this.copyToClipboard.bind(this)

    this.state = {
      name: '',
      seed: [],
      randomLetters: 10,
      randomizedLetter: [],
      isLoading: false,
      initialization: [true, false, false],
      indexInitialization: 0,
      selectedAvatar: 0
    }
  }

  async componentDidMount() {
    const seed = await popupMessanger.generateSeed()
    this.setState({ seed })
  }

  goBack() {
    this.updateStatusInitialization(this.state.indexInitialization, false)
    this.setState({ indexInitialization: this.state.indexInitialization - 1 })
  }

  async goOn() {
    if (this.state.indexInitialization === 0) {
      const nameAlreadyExixts = await popupMessanger.isAccountNameAlreadyExists(
        this.state.name
      )
      if (nameAlreadyExixts) {
        this.props.setNotification({
          type: 'danger',
          text: 'Account Name Already Exists',
          position: 'under-bar'
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
    textField.innerText = seed
    document.body.appendChild(textField)
    textField.select()
    document.execCommand('copy')
    textField.remove()
    this.props.setNotification({
      type: 'success',
      text: 'Copied!',
      position: 'under-bar'
    })
  }

  render() {
    return (
      <React.Fragment>
        {this.state.isLoading ? (
          <React.Fragment>
            <div className="container">
              <div className="row mt-5 mb-3">
                <div className="col-12 text-center text-lg text-blue">
                  I'm creating the new Account!
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
              <Name
                value={this.state.name}
                onChange={e => {
                  this.setState({ name: e.target.value })
                }}
              />
            ) : (
              ''
            )}
            {this.state.initialization[1] ? (
              <GenerateSeed
                randomLetters={this.state.randomLetters}
                onLetterClick={index => this.randomiseSeedLetter(index)}
                seed={this.state.seed}
              />
            ) : (
              ''
            )}
            {this.state.initialization[2] ? (
              <Avatar
                selectedAvatar={this.state.selectedAvatar}
                onAvatarClick={number =>
                  this.setState({ selectedAvatar: number })
                }
              />
            ) : (
              ''
            )}
            {this.state.initialization[3] ? (
              <Export
                seed={this.state.seed}
                onCopyToClipboard={this.copyToClipboard}
              />
            ) : (
              ''
            )}
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
                      this.state.initialization[0]
                        ? this.state.name.length > 0
                          ? false
                          : true
                        : this.state.initialization[1]
                        ? this.state.randomLetters === 0
                          ? false
                          : true
                        : this.state.initialization[2]
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
          </React.Fragment>
        )}
      </React.Fragment>
    )
  }
}

export default Add
