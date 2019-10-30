import React, { Component } from 'react'
import { PopupAPI } from '@pegasus/lib/api'

class Connector extends Component {

  constructor(props, context) {
    super(props, context)

    this.state = {
      favicon: null,
      hostname: ''
    }
  }

  async componentDidMount() {
    const website = await PopupAPI.getWebsite()
    this.setState({
      favicon: website.favicon,
      hostname: website.hostname
    })
  }

  render() {
    return (
      <div className="container">
        <div className="row mt-3">
          <div className='col-2'>
            <img className="border-radius-50" src="./material/logo/pegasus-64.png" height="50" width="50" alt="pegasus logo"/>
          </div>
          <div className="col-10 text-right text-blue text-md my-auto">Confirm Connection</div>
        </div>
        <hr className="mt-2 mb-2" />
        <div className="row">
          <div className="col-4 text-center">
            <img className="border-radius-50"
              src={this.state.favicon ? this.state.favicon : './material/img/domain.png'} 
              height='64'
              width='64'
              alt='website logo'/>
          </div>
          <div className="col-4 text-center my-auto">
            <img src="./material/img/broken-link.png"
              height="30" 
              width="30"
              alt="broken-link logo"/>
          </div>
          <div className="col-4 text-center">
            <img className="border-radius-50" src="./material/logo/pegasus-128.png"
              height="64"
              width="64"
              alt="pegasus logo"/>
          </div>
        </div>
        <div className="row mt-05">
          <div className="col-4 text-center text-xxs text-bold">
            {this.state.hostname}
          </div>
          <div className="col-4 text-center text-xxxs my-auto pl-0 pr-0 text-gray">
            wants to connect with
          </div>
          <div className="col-4 text-center text-xxs text-bold">
            Pegasus
          </div>
        </div>
        <div className="row mt-5">
          <div className="col-12 text-center text-md text-bold">
            Are you sure you want to enable the connection with this website?
          </div>
        </div>
        <div className="row mt-1">
          <div className="col-12 text-center text-xs text-gray">
            allowing, the website will be able to safely interact with the Wallet thanks to the Pegasus Connector!
          </div>
        </div>
        <div className="row mt-12">
          <div className="col-6 pl-5 pr-5">
            <button onClick={() => this.props.onPermissionNotGranted()} 
              className="btn btn-border-blue text-sm text-bold btn-big">
                Reject
            </button>
          </div>
          <div className="col-6 pl-5 pr-5">
            <button onClick={() => this.props.onPermissionGranted()} 
              className="btn btn-blue text-sm text-bold btn-big">
                Confirm
            </button>
          </div>
        </div>
      </div>
    )
  }
}

export default Connector