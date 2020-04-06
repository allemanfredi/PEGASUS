import React, { Component } from 'react'
import ConfirmTransfers from './confirmTransfers/ConfirmTransfers'
import Loader from '../../components/loader/Loader'
import RequestsCounter from '../../components/requestsCounter/RequestsCounter'
import { APP_STATE } from '@pegasus/utils/states'

class ConfirmRequest extends Component {
  constructor(props, context) {
    super(props, context)

    this.reject = this.reject.bind(this)
    this.rejectAll = this.rejectAll.bind(this)
    this.confirm = this.confirm.bind(this)

    this.state = {
      requests: [],
      isLoading: false,
      error: null
    }
  }

  async componentWillMount() {
    this.props.background.on('update', backgroundState => {
      const { requests } = backgroundState

      const executableRequests = requests.filter(
        request => request.needUserInteraction && request.connection.enabled
      )

      this.setState({ requests: executableRequests })
    })

    await this.props.background.setState(
      APP_STATE.WALLET_REQUEST_IN_QUEUE_WITH_USER_INTERACTION
    )

    const requests = await this.props.background.getExecutableRequests()
    const executableRequests = requests.filter(
      request => request.needUserInteraction && request.connection.enabled
    )

    this.setState({ requests: executableRequests })
  }

  async confirm(request) {
    this.setState({
      isLoading: true,
      error: null
    })

    await this.props.background.confirmRequest(request)

    this.setState({ isLoading: false })
  }

  async reject(request) {
    await this.props.background.rejectRequest(request)
  }

  async rejectAll() {
    await this.props.background.rejectRequests()
  }

  render() {
    const request = this.state.requests[0]

    if (request) {
      switch (request.method) {
        case 'transfer':
          return (
            <React.Fragment>
              <ConfirmTransfers
                title="Confirm Transfer"
                account={this.props.account}
                network={this.props.network}
                isLoading={this.state.isLoading}
                error={this.state.error}
                transfer={request}
                canChangeAccount={true}
                background={this.props.background}
                onConfirm={this.confirm}
                onReject={this.reject}
              />
              <RequestsCounter requests={this.state.requests} />
            </React.Fragment>
          )

        case 'sendTrytes':
          return (
            <React.Fragment>
              <ConfirmTransfers
                title="Sending Trytes"
                account={this.props.account}
                network={this.props.network}
                isLoading={this.state.isLoading}
                error={this.state.error}
                transfer={request}
                canChangeAccount={false}
                background={this.props.background}
                isTrytes={true}
                onConfirm={this.confirm}
                onReject={this.reject}
              />
              <RequestsCounter requests={this.state.requests} />
            </React.Fragment>
          )

        case 'prepareTransfers':
          return (
            <React.Fragment>
              <ConfirmTransfers
                title="Prepare Transfers"
                account={this.props.account}
                network={this.props.network}
                isLoading={this.state.isLoading}
                error={this.state.error}
                transfer={request}
                canChangeAccount={true}
                background={this.props.background}
                onConfirm={this.confirm}
                onReject={this.reject}
              />
              <RequestsCounter requests={this.state.requests} />
            </React.Fragment>
          )
        default:
          return null
      }
    } else return <Loader />
  }
}

export default ConfirmRequest
