import React, { Component } from 'react'
import RegisterMamChannel from './RegisterMamChannel.jsx/RegisterMamChannel'

class MamChannels extends Component {
  constructor(props, context) {
    super(props, context)

    this.goBack = this.goBack.bind(this)

    this.state = {
      showRegisterChannel: false,
      showChannelList: false,
      error: null
    }
  }

  goBack() {
    this.setState({
      showRegisterChannel: false,
      showChannelList: false
    })
  }

  render() {
    return (
      <div className="container">
        {
          !this.state.showRegisterChannel && !this.state.showChannelList
            ? <React.Fragment>
                <div className='row mt-4'>
                  <div className='col-12 text-center'>
                    <button disabled={this.state.dstAddress === '' ? true : false}
                      onClick={() => {
                        if (!this.state.showRegisterChannel)
                          this.props.onChangeCanGoBack(false)
                        else 
                          this.props.onChangeCanGoBack(true)
                        this.setState({ showRegisterChannel: !this.state.showRegisterChannel })
                      }}
                      className='btn btn-blue text-bold btn-big'>
                      Register Channel
                  </button>
                  </div>
                </div>
                <div className='row mt-4'>
                  <div className='col-12 text-center'>
                    <button disabled={this.state.dstAddress === '' ? true : false}
                      onClick={() => {
                        if (!this.state.showChannelList)
                          this.props.onChangeCanGoBack(false)
                        else 
                          this.props.onChangeCanGoBack(true)
                        
                        this.setState({ showChannelList: !this.state.showChannelList })
                      }}
                      className='btn btn-blue text-bold btn-big'>
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
      </div>
    )
  }
}

export default MamChannels