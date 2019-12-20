import React, { Component } from 'react'
import RegisterMamChannel from './registerMamChannel/RegisterMamChannel'
import ShowChannelsList from './showChannelsList/ShowChannelsList'

class MamChannels extends Component {
  constructor(props, context) {
    super(props, context)

    this.goBack = this.goBack.bind(this)

    this.state = {
      showRegisterChannel: false,
      showChannelsList: false,
      error: null
    }
  }

  goBack() {
    this.setState({
      showRegisterChannel: false,
      showChannelsList: false
    })
    this.props.onChangeCanGoBack(true)
  }

  render() {
    return (
      <div className="container">
        {
          !this.state.showRegisterChannel && !this.state.showChannelsList
            ? <div className="container">
                <div className="row cursor-pointer" 
                  onClick={() => {
                    if (!this.state.showRegisterChannel)
                          this.props.onChangeCanGoBack(null)
                    this.setState({ showRegisterChannel: ! this.state.showRegisterChannel})
                  }}>
                  <div className="col-12">
                    <div className="row mt-3">
                      <div className="col-3">
                        <img src="./material/img/documentary.svg" height="50" width="50" alt="documentary logo"/>
                      </div>
                      <div className="col-9 text-blue text-left text-md font-weight-bold my-auto">
                        Register Channel
                      </div>
                    </div>
                    <div className="row mt-3 justify-content-center">
                      <div className="col-10 text-center text-xs text-gray">
                        It is possible to manually add a MAM Channel (as subscriber)
                      </div>
                    </div>
                  </div>
                </div>

                <hr className="mt-2"/>

                <div className="row cursor-pointer"
                  onClick={() => {
                    if (!this.state.showChannelsList)
                          this.props.onChangeCanGoBack(null)
                    this.setState({ showChannelsList: ! this.state.showChannelsList})
                  }}>
                  <div className="col-12">
                    <div className="row mt-3">
                      <div className="col-3">
                        <img src="./material/img/channel-list.svg" height="50" width="50" alt="list logo"/>
                      </div>
                      <div className="col-9 text-blue text-left text-md font-weight-bold my-auto">
                        Show Channels List
                      </div>
                    </div>
                    <div className="row mt-3 justify-content-center">
                      <div className="col-10 text-center text-xs text-gray">
                        Before you can export the seed you will need to enter the login password
                      </div>
                    </div>
                  </div>
                </div>

                <hr className="mt-2 mb-2"/>
              </div>
            : null
        }
        {
          this.state.showRegisterChannel
            ? <RegisterMamChannel onBack={() => this.props.onBack()}/>
            : null
        }
        {
          this.state.showChannelsList
            ? <ShowChannelsList onBack={() => this.props.onBack()}/>
            : null
        }
      </div>
    )
  }
}

export default MamChannels