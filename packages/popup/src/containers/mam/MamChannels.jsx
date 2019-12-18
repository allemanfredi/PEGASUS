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
            ? <React.Fragment>
                <div className='row mt-18'>
                  <div className='col-12 text-center'>
                    <button onClick={() => {
                        if (!this.state.showRegisterChannel)
                          this.props.onChangeCanGoBack(null)
                          
                        this.setState({ showRegisterChannel: !this.state.showRegisterChannel })
                      }}
                      className='btn btn-border-blue text-bold btn-big'>
                      Register Channel
                  </button>
                  </div>
                </div>
                <div className='row mt-2'>
                  <div className='col-12 text-center'>
                    <button onClick={() => {
                        if (!this.state.showChannelsList)
                          this.props.onChangeCanGoBack(null)
                        
                        this.setState({ showChannelsList: !this.state.showChannelsList })
                      }}
                      className='btn btn-border-blue text-bold btn-big'>
                      Show Channels
                  </button>
                  </div>
                </div>
              </React.Fragment>
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