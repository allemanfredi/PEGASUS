import React, { Component } from 'react'
import Utils from '@pegasus/utils/utils'
import { composeAPI } from '@iota/core'
import OutlinedInput from '../../components/outlinedInput/OutlinedInput'

class Network extends Component {
  constructor(props, context) {
    super(props, context)

    this.addNetwork = this.addNetwork.bind(this)

    this.state = {
      name: '',
      url: '',
      port: '',
      type: ''
    }
  }

  async addNetwork() {
    if (!Utils.isURL(this.state.url)) {
      this.props.setNotification({
        type: 'danger',
        text: 'Invalid URL',
        position: 'under-bar'
      })
      return
    }

    if (isNaN(this.state.port)) {
      this.props.setNotification({
        type: 'danger',
        text: 'Invalid Port Number',
        position: 'under-bar'
      })
      return
    }

    const iota = composeAPI({
      provider: `${this.state.url}:${this.state.port}`
    })

    try {
      await iota.getNodeInfo()
    } catch (err) {
      this.props.setNotification({
        type: 'danger',
        text: 'Node Unreachable',
        position: 'under-bar'
      })
      return
    }

    let link = 'https://thetangle.org/'
    if (this.state.type === 'devnet') link = 'https://devnet.thetangle.org/'
    if (this.state.type === 'comnet') link = 'https://comnet.thetangle.org/'

    let difficulty = 14
    if (this.state.type === 'devnet') difficulty = 9
    if (this.state.type === 'comnet') difficulty = 10

    const network = {
      name: this.state.name,
      provider: `${this.state.url}:${this.state.port}`,
      link,
      type: this.state.type,
      difficulty,
      default: false
    }

    await this.props.background.addNetwork(network)
    await this.props.background.setCurrentNetwork(network)

    this.props.onBack()
  }

  render() {
    return (
      <div className="container">
        <div className="row mt-2">
          <div className="col-12 text-center">
            <img
              src="./material/img/neural.png"
              height="100"
              width="100"
              alt="neural logo"
            />
          </div>
        </div>
        <div className="row mt-3">
          <div className="col-12">
            <OutlinedInput
              value={this.state.name}
              onChange={e => this.setState({ name: e.target.value })}
              label="name"
              id="inp-node-name"
            />
          </div>
        </div>
        <div className="row mt-2">
          <div className="col-12">
            <OutlinedInput
              value={this.state.url}
              onChange={e => this.setState({ url: e.target.value })}
              label="URL"
              id="inp-node-url"
            />
          </div>
        </div>
        <div className="row mt-2">
          <div className="col-12">
            <OutlinedInput
              value={this.state.port}
              onChange={e => this.setState({ port: e.target.value })}
              label="port"
              id="inp-node-port"
            />
          </div>
        </div>
        <div className="row mt-2">
          <div className="col-4 text-left">
            <input
              onChange={() => this.setState({ type: 'mainnet' })}
              name="network"
              id="mainnet"
              type="radio"
              value="Base"
            />
            <label for="mainnet" class="text-xxs">
              Mainnet
            </label>
          </div>
          <div className="col-4 text-left">
            <input
              onChange={() => this.setState({ type: 'devnet' })}
              name="network"
              id="devnet"
              type="radio"
              value="Base"
            />
            <label for="devnet" class="text-xxs">
              Testnet
            </label>
          </div>
          <div className="col-4 text-left">
            <input
              onChange={() => this.setState({ type: 'comnet' })}
              name="network"
              id="comnet"
              type="radio"
              value="Base"
            />
            <label for="comnet" class="text-xxs">
              Comnet
            </label>
          </div>
        </div>
        <div className="row mt-4">
          <div className="col-6 text-center mx-auto">
            <button
              onClick={() => this.props.onBack()}
              type="submit"
              className="btn btn-border-blue text-bold btn-big"
            >
              Cancel
            </button>
          </div>
          <div className="col-6 text-center mx-auto">
            <button
              disabled={
                this.state.name === '' ||
                this.state.url === '' ||
                this.state.port === '' ||
                this.state.type === ''
                  ? true
                  : false
              }
              onClick={this.addNetwork}
              type="submit"
              className="btn btn-blue text-bold btn-big"
            >
              Add
            </button>
          </div>
        </div>
      </div>
    )
  }
}

export default Network
