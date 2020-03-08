import React, { Component } from 'react'
import RegisterMamChannel from './registerMamChannel/RegisterMamChannel'
import ShowChannelsList from './showChannelsList/ShowChannelsList'
import MamExplorer from './mamExplorer/MamExplorer'

const options = {
  0: 'Register Channel',
  1: 'Channels List',
  2: 'MAM Explorer'
}

class Mam extends Component {
  constructor(props, context) {
    super(props, context)

    this.goBack = this.goBack.bind(this)

    this.state = {
      showRegisterChannel: false,
      show: [false, false, false],
      error: null
    }
  }

  goBack() {
    this.setState({
      show: [false, false, false]
    })
    this.props.onChangeCanGoBack(true)
    this.props.changeNavbarText('Settings')
  }

  render() {
    const items = [
      {
        title: 'Register Channel',
        description:
          'It is possible to manually add a MAM Channel (as subscriber)'
      },
      {
        title: 'Show Channels List',
        description:
          'Before you can export the seed you will need to enter the login password'
      },
      {
        title: 'MAM Explorer',
        description: "Monitor what's going on on the MAM channels"
      }
    ]
    return (
      <div className="container overflow-auto-475h">
        {!this.state.show.includes(true) ? (
          <React.Fragment>
            {items.map((item, index) => {
              return (
                <React.Fragment>
                  <div
                    className="row cursor-pointer"
                    onClick={() => {
                      if (!this.state.showRegisterChannel)
                        this.props.onChangeCanGoBack(null)

                      this.props.changeNavbarText(options[index])
                      this.setState(() => {
                        const show = [false, false, false]
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
                          {item.title}
                        </div>
                      </div>
                      <div className="row">
                        <div className="col-12 text-gray text-xs mb-1">
                          {item.description}
                        </div>
                      </div>
                    </div>
                    <div className="col-3 my-auto text-right">
                      <img src="./material/img/right.png" height="50" />
                    </div>
                  </div>
                  <hr className="mt-2" />
                </React.Fragment>
              )
            })}
          </React.Fragment>
        ) : null}
        {this.state.show[0] ? (
          <RegisterMamChannel onBack={() => this.props.onBack()} />
        ) : null}
        {this.state.show[1] ? (
          <ShowChannelsList onBack={() => this.props.onBack()} />
        ) : null}
        {this.state.show[2] ? (
          <MamExplorer
            duplex={this.props.duplex}
            onBack={() => this.props.onBack()}
          />
        ) : null}
      </div>
    )
  }
}

export default Mam
