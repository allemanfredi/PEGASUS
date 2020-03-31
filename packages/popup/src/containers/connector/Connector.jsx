import React, { Component } from 'react'

class Connector extends Component {
  constructor(props, context) {
    super(props, context)

    this.state = {
      connections: []
    }
  }

  async componentDidMount() {
    const connections = await this.props.background.getConnectionRequests()
    this.setState({
      connections
    })

    this.props.background.on('update', backgroundState => {
      const { connectionRequests } = backgroundState
      this.setState({ connections: connectionRequests })
    })
  }

  render() {
    return this.state.connections.map(connection => {
      return (
        <div className="container">
          <div className="row mt-3">
            <div className="col-2">
              <img
                className="border-radius-50"
                src="./material/logo/pegasus-64.png"
                height="50"
                width="50"
                alt="pegasus logo"
              />
            </div>
            <div className="col-10 text-right text-blue text-md my-auto">
              Confirm Connection
            </div>
          </div>
          <hr className="mt-2 mb-2" />
          <div className="row">
            <div className="col-4 text-center">
              <img
                className="border-radius-50"
                src={
                  connection.website.favicon
                    ? connection.website.favicon
                    : `${connection.website.hostname}/favicon.ico`
                }
                height="64"
                width="64"
                alt="website logo"
              />
            </div>
            <div className="col-4 text-center my-auto">
              <img
                src="./material/img/broken-link.png"
                height="30"
                width="30"
                alt="broken-link logo"
              />
            </div>
            <div className="col-4 text-center">
              <img
                className="border-radius-50"
                src={`./material/profiles/${
                  this.props.account.avatar ? this.props.account.avatar : 1
                }.svg`}
                height="64"
                width="64"
                alt="avatar"
              />
            </div>
          </div>
          <div className="row mt-05">
            <div className="col-4 text-center text-xxs text-bold">
              {connection.website.title}
            </div>
            <div className="col-4 text-center text-xxxs my-auto pl-0 pr-0 text-gray">
              wants to connect with
            </div>
            <div className="col-4 text-center text-xxs text-bold">
              {this.props.account.name}
            </div>
          </div>
          <div className="row mt-5">
            <div className="col-12 text-center text-md text-bold">
              Are you sure you want to enable the connection with this website?
            </div>
          </div>
          <div className="row mt-1">
            <div className="col-12 text-center text-xs text-gray">
              allowing, the website will be able to safely interact with the
              Wallet thanks to the Pegasus Connector!
            </div>
          </div>
          <div className="row mt-12">
            <div className="col-6 pl-5 pr-5">
              <button
                onClick={() => {
                  this.props.onPermissionNotGranted(
                    connection.website.origin,
                    connection.website.tabId
                  )
                }}
                className="btn btn-border-blue text-sm text-bold btn-big"
              >
                Reject
              </button>
            </div>
            <div className="col-6 pl-5 pr-5">
              <button
                onClick={() => {
                  this.props.onPermissionGranted(
                    connection.website.origin,
                    connection.website.tabId
                  )
                }}
                className="btn btn-blue text-sm text-bold btn-big"
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      )
    })
  }
}

export default Connector
