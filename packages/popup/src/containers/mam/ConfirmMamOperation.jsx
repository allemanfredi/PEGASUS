import React, { Component } from 'react'
import { popupMessanger } from '@pegasus/utils/messangers'
import Utils from '@pegasus/utils/utils'

class ConfirmMamOperation extends Component {

  constructor(props, context) {
    super(props, context)

    this.confirm = this.confirm.bind(this)
    this.reject = this.reject.bind(this)

    this.state = {
      mamRequestsWithUserInteraction: []
    }

    this.mamRequestsWithUserInteraction = []
  }

  async componentDidMount() {
    const mamRequestsWithUserInteraction = await popupMessanger.getMamRequestsWithUserInteraction()
    this.setState({ mamRequestsWithUserInteraction })
  }

  async confirm(request) {
    await popupMessanger.confirmMamRequest(request)
    popupMessanger.closePopup()
  }

  async reject(request) {
    await popupMessanger.confirmMamRequest(request)
  }

  render() {

    const request = this.state.mamRequestsWithUserInteraction[0]

    return (

      <div className="container">
        <div className="row mt-3">
          <div className='col-2'>
            <img className="border-radius-50" src='./material/logo/pegasus-64.png' height='50' width='50' alt='pegasus logo' />
          </div>
          <div className="col-10 text-right text-blue text-md">Confirm MAM operation</div>
        </div>

        <hr className="mt-2 mb-2" />

        <div className="row mt-2">
          <div className="col-6 text-left text-xxs text-blue">Operation to confirm</div>
          <div className="col-6 text-right text-md break-text">
            {
              request
                ? request.method 
                : '-'
            }
          </div>
        </div>

        <div className="row mt-2">
          <div className="col-4 text-left text-xxs text-blue">params</div>
          <div className="col-8 text-right text-md break-text">
            {
              request
                ? request.args 
                : '-'
            }
          </div>
        </div>

        <hr className="mt-2 mb-2" />

        <div className="row mt-12">
          <div className="col-6 pl-5 pr-5">
            <button onClick={() => this.reject(request)}
              className="btn btn-border-blue text-sm text-bold btn-big">
              Reject
          </button>
          </div>
          <div className="col-6 pl-5 pr-5">
            <button onClick={() => this.confirm(request)}
              className="btn btn-blue text-sm text-bold btn-big">
              Confirm
          </button>
          </div>
        </div>

      </div>

    )
  }
}

export default ConfirmMamOperation