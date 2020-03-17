import React, { Component } from 'react'
import ConfirmTransfers from './confirmTransfers/ConfirmTransfers'
import ConfirmCreateMamChannel from './confirmCreateMamChannel/ConfirmCreateMamChannel'
import ConfirmChangeModeMamChannel from './confirmChangeModeMamChannel/ConfirmChangeModeMamChannel'
import Loader from '../../components/loader/Loader'
import { APP_STATE } from '@pegasus/utils/states'

class ConfirmRequest extends Component {
  constructor(props, context) {
    super(props, context)

    this.reject = this.reject.bind(this)
    this.rejectAll = this.rejectAll.bind(this)
    this.confirm = this.confirm.bind(this)
    this.getRequests = this.getRequests.bind(this)

    this.state = {
      requests: []
    }
  }

  async getRequests() {
    const executableRequests = await this.props.background.getExecutableRequests()
    const requests = executableRequests.filter(
      request => request.needUserInteraction
    )
    this.setState({ requests })
  }

  async componentWillMount() {
    await this.props.background.setState(
      APP_STATE.WALLET_REQUEST_IN_QUEUE_WITH_USER_INTERACTION
    )

    await this.getRequests()
  }

  async confirm(request) {
    await this.props.background.confirmRequest(request)
    await this.getRequests()
  }

  async reject(request) {
    await this.props.background.rejectRequest(request)
    await this.getRequests()
  }

  rejectAll() {
    this.props.background.rejectRequests()
  }

  render() {
    const request = this.state.requests[0]

    if (request) {
      switch (request.method) {
        case 'prepareTransfers':
          return (
            <ConfirmTransfers
              transfer={request}
              background={this.props.background}
              onConfirm={this.confirm}
              onReject={this.reject}
            />
          )

        case 'mam_init':
          return (
            <ConfirmCreateMamChannel
              request={request}
              onConfirm={this.confirm}
              onReject={this.reject}
            />
          )
        case 'mam_changeMode':
          return (
            <ConfirmChangeModeMamChannel
              from={request.args[0].channel.mode}
              to={request.args[1]}
              sidekey={request.args[2] ? request.args[2] : null}
              request={request}
              onConfirm={this.confirm}
              onReject={this.reject}
            />
          )
        default:
          return null
      }
    } else return <Loader />
  }
}

export default ConfirmRequest
