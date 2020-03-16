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

    this.state = {
      requests: []
    }
  }

  async componentWillMount() {
    await this.props.background.setState(
      APP_STATE.WALLET_REQUEST_IN_QUEUE_WITH_USER_INTERACTION
    )

    const executableRequests = await this.props.background.getExecutableRequests()
    const requests = executableRequests.filter(
      request => request.needUserInteraction
    )
    this.setState({ requests })

    /*this.props.duplex.on('setRequests', requests => {
      this.setState({ requests })
    })*/
  }

  async confirm(request) {
    await this.props.background.confirmRequest(request)
  }

  async reject(request) {
    await this.props.background.rejectRequest(request)
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
              background={this.props.this.props.background}
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
              from={request.data.args[0].channel.mode}
              to={request.data.args[1]}
              sidekey={request.data.args[2] ? request.data.args[2] : null}
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
