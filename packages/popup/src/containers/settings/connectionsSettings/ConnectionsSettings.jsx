import React from 'react'
import OutlinedInput from '../../../components/outlinedInput/OutlinedInput'
import Utils from '@pegasus/utils/utils'
import Url from 'url-parse'

class ConnectionsSettings extends React.Component {
  constructor(props, context) {
    super(props, context)

    this.handleAddWebsite = this.handleAddWebsite.bind(this)
    this.removeConnection = this.removeConnection.bind(this)

    this.state = {
      connections: {},
      requestor: ''
    }
  }

  async componentWillMount() {
    const connections = await this.props.background.getConnections()
    if (!connections) return

    this.setState({ connections })
  }

  async handleAddWebsite(e) {
    e.preventDefault()
    if (!Utils.isURL(this.state.requestor)) {
      this.props.setNotification({
        type: 'danger',
        text: 'Invalid Website URL',
        position: 'under-bar'
      })
      return
    }

    const url = new Url(this.state.requestor)

    const account = this.props.background.getCurrentAccount()

    const connection = {
      requestToConnect: false,
      connected: true,
      enabled: true,
      accountId: account.id,
      requestor: {
        icon: `${url.origin}/favicon.ico`,
        hostname: url.hostname,
        origin: url.origin
      }
    }

    const isAdded = await this.props.background.addConnection(connection)
    if (!isAdded) {
      this.props.setNotification({
        type: 'danger',
        text: 'Website already present',
        position: 'under-bar'
      })
      return
    }

    const connections = await this.props.background.getConnections()
    this.setState({
      connections
    })
  }

  async removeConnection(connection) {
    const isRemoved = await this.props.background.removeConnection(
      connection.requestor.origin
    )
    if (isRemoved) {
      this.props.setNotification({
        type: 'success',
        text: 'Connection Removed Succesfully',
        position: 'under-bar'
      })

      const connections = await this.props.background.getConnections()
      this.setState({
        connections
      })
    }
  }

  render() {
    return (
      <React.Fragment>
        <div className="row">
          <div className="col-12 text-dark-gray mt-2 text-md">Add website</div>
        </div>
        <div className="row mt-1">
          <div className="col-12">
            <OutlinedInput
              value={this.state.requestor}
              onChange={e => this.setState({ requestor: e.target.value })}
              label="website"
              id="website-id"
              type="text"
            />
          </div>
        </div>

        <form onSubmit={this.handleAddWebsite}>
          <div className="row mt-2">
            <div className="col-12">
              <button onClick={this.handleAddWebsite} className="btn btn-blue">
                Connect
              </button>
            </div>
          </div>
        </form>

        <hr className="mb-2 mt-2" />

        <div className="row mt-1">
          <div className="col-12 text-gray mb-1">Connected Websites</div>
        </div>

        {Object.values(this.state.connections)
          .filter(
            connection =>
              connection.enabled && connection.requestor.hostname !== 'pegasus'
          )
          .map(connection => {
            return (
              <div key={connection.requestor.hostname} className="row mt-1">
                <div className="col-3">
                  <img
                    className="border-radius-50"
                    src={
                      connection.requestor.icon
                        ? connection.requestor.icon
                        : `${connection.requestor.hostname}/favicon.ico`
                    }
                    height="25"
                    width="25"
                    alt="requestor logo"
                  />
                </div>
                <div className="col-6 text-black text-xs text-center font-weight-bold my-auto">
                  {connection.requestor.hostname}
                </div>
                <div className="col-3 my-auto text-right">
                  <i
                    onClick={() => this.removeConnection(connection)}
                    className="fa fa-trash cursor-pointer"
                  />
                </div>
              </div>
            )
          })}
      </React.Fragment>
    )
  }
}

export default ConnectionsSettings
