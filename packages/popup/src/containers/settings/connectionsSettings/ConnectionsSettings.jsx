import React from 'react'
import { popupMessanger } from '@pegasus/utils/messangers'
import Input from '../../../components/input/Input'

class ConnectionsSettings extends React.Component {
  constructor(props, context) {
    super(props, context)

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

        <div className="row mt-2">
          <div className="col-12">
            <button className="btn btn-blue">Connect</button>
          </div>
        </div>

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
                      : './material/img/domain.png'
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
                <i className="fa fa-trash" />
              </div>
            </div>
          )
        })}
      </React.Fragment>
    )
  }
}

export default ConnectionsSettings
