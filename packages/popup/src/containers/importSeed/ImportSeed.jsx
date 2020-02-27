import React, { Component } from 'react'
import { popupMessanger } from '@pegasus/utils/messangers'
import Loader from '../../components/loader/Loader'
import Input from '../../components/input/Input'

class ImportSeed extends Component {
  constructor(props, context) {
    super(props, context)

    this.onImport = this.onImport.bind(this)
    this.onChangeSeed = this.onChangeSeed.bind(this)

    this.state = {
      isValidSeed: false,
      seed: '',
      name: '',
      isLoading: false
    }
  }

  async onImport() {
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
    const isValidSeed = await popupMessanger.isSeedValid(this.state.seed)
    if (!isValidSeed) {
      this.props.setNotification({
        type: 'danger',
        text: 'Invalid Seed',
        position: 'under-bar'
      })
      return
    }
    try {
      this.setState({ isLoading: true })
      const account = {
        seed: this.state.seed,
        name: this.state.name
      }
      const isAdded = await popupMessanger.addAccount(
        account,
        this.props.network,
        true
      )

      this.setState({ isLoading: false })

      if (!isAdded) {
        this.props.setNotification({
          type: 'danger',
          text: 'Error during importing the Seed! Try Again!',
          position: 'under-bar'
        })
        return
      }

      this.props.onBack()
    } catch (e) {
      this.setState({
        error: e.message
      })
    }
  }

  onChangeSeed(e) {
    if (this.state.error) {
      this.setState({
        error: null
      })
    }
    this.setState({ seed: e.target.value })
  }

  render() {
    return (
      <React.Fragment>
        {this.state.isLoading ? (
          <Loader />
        ) : (
          <div className="container">
            <div className="row mt-2 mb-3">
              <div className="col-12 text-center text-lg text-blue text-bold">
                Paste your seed here and choose a name!
              </div>
            </div>
            <div className="row mt-8">
              <div className="col-12 text-xs text-gray">seed</div>
            </div>
            <div className="row mt-05">
              <div className="col-12">
                <textarea
                  rows={3}
                  value={this.state.seed}
                  onChange={this.onChangeSeed}
                />
              </div>
            </div>
            <div className="row mt-2">
              <div className="col-12">
                <Input
                  value={this.state.name}
                  onChange={e => this.setState({ name: e.target.value })}
                  label="name"
                  id="inp-name"
                />
              </div>
            </div>
            <div className="row mt-1">
              <div className="col-12">
                <button
                  disabled={
                    this.state.seed.length === 0 || this.state.name.length === 0
                  }
                  onClick={this.onImport}
                  type="submit"
                  className="btn btn-blue text-bold btn-big"
                >
                  Import Seed
                </button>
              </div>
            </div>
          </div>
        )}
      </React.Fragment>
    )
  }
}

export default ImportSeed
