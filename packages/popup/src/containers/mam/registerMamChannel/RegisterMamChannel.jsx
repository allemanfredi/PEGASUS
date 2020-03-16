import React, { Component } from 'react'
import Picklist from '../../../components/picklist/Picklist'

import Utils from '@pegasus/utils/utils'
import Input from '../../../components/input/Input'

class RegisterMamChannel extends Component {
  constructor(props, context) {
    super(props, context)

    this.registerChannel = this.registerChannel.bind(this)

    this.state = {
      channelModes: ['private', 'public', 'restricted'],
      registerChannelRoot: '',
      registerChannelMode: '',
      registerChannelSidekey: '',
      error: null
    }
  }

  async registerChannel() {
    this.setState({
      error: null,
      success: null
    })

    if (!Utils.isValidAddress(this.state.registerChannelRoot)) {
      this.setState({
        error: 'Invalid Root'
      })
      return
    }

    if (
      this.state.registerChannelSidekey.length === 0 &&
      this.state.registerChannelMode === 'restricted'
    ) {
      this.setState({
        error: 'Invalid Sidekey'
      })
      return
    }

    const res = await this.props.background.registerMamChannel({
      sidekey: this.state.registerChannelSidekey,
      root: this.state.registerChannelRoot,
      mode: this.state.registerChannelMode
    })

    if (res) {
      this.setState({
        success: 'Channel succesfully registered'
      })
    } else {
      this.setState({
        error: 'Channel NOT registered'
      })
    }
  }

  render() {
    return (
      <React.Fragment>
        <div className="row mt-4">
          <div className="col-12">
            <Input
              value={this.state.registerChannelRoot}
              onChange={e =>
                this.setState({ registerChannelRoot: e.target.value })
              }
              label="root"
              id="inp-node-root"
            />
          </div>
        </div>
        <div className="row mt-3">
          <div className="col-12">
            <Picklist
              placeholder="mode"
              text={this.state.registerChannelMode}
              options={this.state.channelModes}
              onSelect={index =>
                this.setState({
                  registerChannelMode: this.state.channelModes[index]
                })
              }
            />
          </div>
        </div>
        {this.state.registerChannelMode === 'restricted' ? (
          <div className="row mt-3">
            <div className="col-12">
              <Input
                value={this.state.registerChannelSidekey}
                onChange={e =>
                  this.setState({ registerChannelSidekey: e.target.value })
                }
                label="sidekey"
                id="inp-sidekey"
              />
            </div>
          </div>
        ) : (
          ''
        )}
        {this.state.error ? (
          <div className="row mt-3">
            <div className="col-12 text-xs">
              <div class="alert alert-danger" role="alert">
                {this.state.error}
              </div>
            </div>
          </div>
        ) : (
          ''
        )}
        {this.state.success ? (
          <div className="row mt-3">
            <div className="col-12 text-xs">
              <div class="alert alert-success" role="alert">
                {this.state.success}
              </div>
            </div>
          </div>
        ) : (
          ''
        )}
        <div
          className={
            'row ' + (!this.state.success && !this.state.error ? 'mt-4' : '')
          }
        >
          <div className="col-12 text-center">
            <button
              disabled={
                this.state.registerChannelRoot === '' ||
                this.state.registerChannelMode === ''
              }
              onClick={this.registerChannel}
              className="btn btn-blue text-bold btn-big"
            >
              Register Channel
            </button>
          </div>
        </div>
      </React.Fragment>
    )
  }
}

export default RegisterMamChannel
