import React from 'react'
import TransactionsSettings from './transactionsSettings/TransactionsSettings'
import ConnectionsSettings from './connectionsSettings/ConnectionsSettings'

const settings = [
  {
    title: 'Connections',
    description: 'Take a look at which websites are connected with Pegasus'
  },
  {
    title: 'Transactions',
    description: 'Manage transactions settings'
  }
]

const options = {
  0: 'Connections',
  1: 'Transactions'
}

class Settings extends React.Component {
  constructor(props, context) {
    super(props, context)

    this.goBack = this.goBack.bind(this)

    this.state = {
      show: [false, false]
    }
  }

  goBack() {
    this.setState({
      show: [false, false]
    })
    this.props.onChangeCanGoBack(true)
    this.props.changeNavbarText('Settings')
  }

  render() {
    return (
      <div className="container overflow-auto-475h">
        {!this.state.show.includes(true)
          ? settings.map((setting, index) => {
              return (
                <React.Fragment>
                  <div
                    className="row cursor-pointer"
                    onClick={() => {
                      this.props.changeNavbarText(options[index])
                      this.props.onChangeCanGoBack(null)
                      this.setState(() => {
                        const show = [false, false]
                        show[index] = true
                        return {
                          show
                        }
                      })
                    }}
                  >
                    <div className="col-9 mt-2">
                      <div className="row">
                        <div className="col-12 text-dark-gray font-weight-bold text-md">
                          {setting.title}
                        </div>
                      </div>
                      <div className="row">
                        <div className="col-12 text-gray text-xs mb-1">
                          {setting.description}
                        </div>
                      </div>
                    </div>
                    <div className="col-3 my-auto text-right">
                      <img src="./material/img/right.png" height="50" />
                    </div>
                  </div>
                  <hr className="mt-1" />
                </React.Fragment>
              )
            })
          : null}
        {this.state.show[0] ? (
          <ConnectionsSettings
            background={this.props.background}
            setNotification={this.props.setNotification}
          />
        ) : null}
        {this.state.show[1] ? (
          <TransactionsSettings
            background={this.props.background}
            setNotification={this.props.setNotification}
          />
        ) : null}
      </div>
    )
  }
}

export default Settings
