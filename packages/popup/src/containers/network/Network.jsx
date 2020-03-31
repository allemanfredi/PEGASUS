import React, { Component } from 'react'
import Utils from '@pegasus/utils/utils'
import { composeAPI } from '@iota/core'
import Input from '../../components/input/Input'

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

    const network = {
      name: this.state.name,
      provider: `${this.state.url}:${this.state.port}`,
      link:
        this.state.type === 'mainnet'
          ? 'https://thetangle.org/'
          : 'https://devnet.thetangle.org/',
      type: this.state.type,
      difficulty: this.state.type === 'mainnet' ? 14 : 9,
      default: false
    }

    await this.props.background.addNetwork(network)
    await this.props.background.setCurrentNetwork(network)

    this.props.onBack()
  }

  render() {
    return (
      <div className="container">
        <div className="row mt-4">
          <div className="col-12">
            <Input
              value={this.state.name}
              onChange={e => this.setState({ name: e.target.value })}
              label="name"
              id="inp-node-name"
            />
          </div>
        </div>
        <div className="row mt-4">
          <div className="col-12">
            <Input
              value={this.state.url}
              onChange={e => this.setState({ url: e.target.value })}
              label="URL"
              id="inp-node-url"
            />
          </div>
        </div>
        <div className="row mt-4">
          <div className="col-12">
            <Input
              value={this.state.port}
              onChange={e => this.setState({ port: e.target.value })}
              label="Port"
              id="inp-node-port"
            />
          </div>
        </div>
        <div className="row mt-4">
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
              onChange={() => this.setState({ type: 'testnet' })}
              name="network"
              id="testnet"
              type="radio"
              value="Base"
            />
            <label for="testnet" class="text-xxs">
              Testnet
            </label>
          </div>
        </div>
        <div className="row mt-8">
          <div className="col-12 text-center">
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
