import React from 'react'
import { popupMessanger } from '@pegasus/utils/messangers'
import Input from '../../../components/input/Input'
import Utils from '@pegasus/utils/utils'
import Url from 'url-parse'

class ConnectionsSettings extends React.Component {
  constructor(props, context) {
    super(props, context)

    this.handleAddWebsite = this.handleAddWebsite.bind(this)
    this.removeConnection = this.removeConnection.bind(this)

    this.state = {
      connections: [],
      website: ''
    }
  }

  async componentWillMount() {
    const connections = await popupMessanger.getConnections()
    if (!connections) return

    this.setState({ connections })
  }

  async handleAddWebsite(e) {
    e.preventDefault()
    if (!Utils.isURL(this.state.website)) {
      this.props.setNotification({
        type: 'danger',
        text: 'Invalid Website URL',
        position: 'under-bar'
      })
      return
    }

    const url = new Url(this.state.website)

    const account = popupMessanger.getCurrentAccount()

    const connection = {
      requestToConnect: false,
      connected: true,
      enabled: true,
      accountId: account.id,
      website: {
        favicon: `${url.origin}/favicon.ico`,
        hostname: url.hostname,
        origin: url.origin
      }
    }

    const isAdded = await popupMessanger.addConnection(connection)
    if (!isAdded) {
      this.props.setNotification({
        type: 'danger',
        text: 'Website already present',
        position: 'under-bar'
      })
      return
    }

    const connections = await popupMessanger.getConnections()
    this.setState({
      connections: connections.filter(connection => connection.enabled)
    })
  }

  async removeConnection(connection) {
    const isRemoved = await popupMessanger.removeConnection(connection)
    if (isRemoved) {
      this.props.setNotification({
        type: 'success',
        text: 'Connection Removed Succesfully',
        position: 'under-bar'
      })

      const connections = await popupMessanger.getConnections()
      this.setState({
        connections: connections.filter(connection => connection.enabled)
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
            <Input
              value={this.state.website}
              onChange={e => this.setState({ website: e.target.value })}
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

        {this.state.connections.map(connection => {
          return (
            <div className="row mt-1">
              <div className="col-3">
                <img
                  className="border-radius-50"
                  src={
                    connection.website.favicon
                      ? connection.website.favicon
                      : `${connection.website.hostname}/favicon.ico`
                  }
                  height="25"
                  width="25"
                  alt="website logo"
                />
              </div>
              <div className="col-6 text-black text-xs text-center font-weight-bold my-auto">
                {connection.website.hostname}
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
