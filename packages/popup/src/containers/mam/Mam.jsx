import React, { Component } from 'react'
import RegisterMamChannel from './registerMamChannel/RegisterMamChannel'
import ShowChannelsList from './showChannelsList/ShowChannelsList'
import MamExplorer from './mamExplorer/MamExplorer'

class Mam extends Component {
  constructor(props, context) {
    super(props, context)

    this.goBack = this.goBack.bind(this)

    this.state = {
      showRegisterChannel: false,
      showChannelsList: false,
      showMamExplorer: false,
      show: [false, false, false],
      error: null
    }
  }

  goBack() {
    this.setState({
      show: [false, false, false]
    })
    this.props.onChangeCanGoBack(true)
  }

  render() {
    const items = [
      {
        image: './material/img/documentary.svg',
        title: 'Register Channel',
        text: 'It is possible to manually add a MAM Channel (as subscriber)'
      },
      {
        image: './material/img/channel-list.svg',
        title: 'Show Channels List',
        text: 'Before you can export the seed you will need to enter the login password'
      },
      {
        image: './material/img/telescope.svg',
        title: 'MAM Explorer',
        text: "Monitor what's going on on the MAM channels"
      }
    ]
    return (
      <div className="container overflow-auto-475h">
        {
          !this.state.show.includes(true)
            ? <React.Fragment>
              {
                items.map((item, index) => {
                  return (
                    <React.Fragment>
                      <div className="row cursor-pointer"
                        onClick={() => {
                          if (!this.state.showRegisterChannel)
                            this.props.onChangeCanGoBack(null)
                          this.setState(() => {
                            const show = [false, false, false]
                            show[index] = true
                            return {
                              show
                            }
                          })
                        }}>
                        <div className="col-12">
                          <div className="row mt-3">
                            <div className="col-3">
                              <img src={item.image} height="50" width="50" alt="documentary logo" />
                            </div>
                            <div className="col-9 text-blue text-left text-md font-weight-bold my-auto">
                              {item.title}
                            </div>
                          </div>
                          <div className="row mt-3 justify-content-center">
                            <div className="col-10 text-center text-xs text-gray">
                              {item.text}
                            </div>
                          </div>
                        </div>
                      </div>
                      <hr className="mt-2" />
                    </React.Fragment>
                  )
                })
              }
            </React.Fragment>
            : null
        }
        {
          this.state.show[0]
            ? <RegisterMamChannel onBack={() => this.props.onBack()} />
            : null
        }
        {
          this.state.show[1]
            ? <ShowChannelsList onBack={() => this.props.onBack()} />
            : null
        }
        {
          this.state.show[2]
            ? <MamExplorer duplex={this.props.duplex}
              onBack={() => this.props.onBack()} />
            : null
        }
      </div>
    )
  }
}

export default Mam