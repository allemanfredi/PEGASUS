import React, { Component } from 'react'
import IOTA from '@pegasus/utils/iota'
import { popupMessanger } from '@pegasus/utils/messangers'
import Loader from '../../components/loader/Loader'


class ImportSeed extends Component {
  constructor(props, context) {
    super(props, context)

    this.onImport = this.onImport.bind(this)
    this.onChangeSeed = this.onChangeSeed.bind(this)

    this.state = {
      isValidSeed: false,
      seed: '',
      name: '',
      error: null,
      isLoading: false
    }
  }

  async onImport() {
    const nameAlreadyExixts = await popupMessanger.isAccountNameAlreadyExists(this.state.name)
    if (nameAlreadyExixts) {
      this.setState({
        error: 'Account name already exists'
      })
      return
    }
    const isValidSeed = await popupMessanger.isSeedValid(this.state.seed)
    if (!isValidSeed) {
      this.setState({
        error: 'Invalid seed'
      })
      return
    }
    try {
      this.setState({ isLoading: true })
      const account = {
        seed: this.state.seed,
        name: this.state.name
      }
      await popupMessanger.addAccount(account, this.props.network, true)
      this.setState({ isLoading: false })
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
        {
          this.state.isLoading
            ? <Loader />
            :
            <div className='container'>
              <div className={'row mt-2 ' + (this.state.error ? 'mb-0' : 'mb-3')}>
                <div className='col-12 text-center text-lg text-blue text-bold'>
                  Paste your seed here and choose a name!
                </div>
              </div>
              <div className={'row ' + (this.state.error ? 'mt-3' : 'mt-8')}>
                <div className='col-12 text-xs text-gray'>
                  seed
                </div>
              </div>
              <div className='row mt-05'>
                <div className='col-12'>
                  <textarea rows={3}
                    value={this.state.seed}
                    onChange={this.onChangeSeed} />
                </div>
              </div>
              <div className='row mt-2'>
                <div className='col-12'>
                  <label htmlFor='inp-name' className='inp'>
                    <input value={this.state.name}
                      onChange={e => this.setState({ name: e.target.value })}
                      type='text' id='inp-name'
                      placeholder='&nbsp;' />
                    <span className='label'>name</span>
                    <span className='border'></span>
                  </label>
                </div>
              </div>
              {
                this.state.error
                  ? <div className="row mt-2">
                    <div className="col-12 text-xs">
                      <div class="alert alert-danger" role="alert">
                        {this.state.error}
                      </div>
                    </div>
                  </div>
                  : ''
              }
              <div className={'row ' + (this.state.error ? 'mt-1' : ' mt-4')}>
                <div className='col-12'>
                  <button disabled={this.state.seed.length === 0 || this.state.name.length === 0}
                    onClick={this.onImport}
                    type='submit'
                    className='btn btn-blue text-bold btn-big'>
                    Import Seed</button>
                </div>
              </div>
            </div>
        }
      </React.Fragment>
    )
  }
}

export default ImportSeed