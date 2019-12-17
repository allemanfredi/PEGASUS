import React, { Component } from 'react'
import { popupMessanger } from '@pegasus/utils/messangers'
import Utils from '@pegasus/utils/utils'
import ConfirmTransfers from './confirmTransfers/ConfirmTransfers'
import Loader from '../../components/loader/Loader'
import Duplex from '@pegasus/utils/duplex'

class ConfirmRequest extends Component {

  constructor(props, context) {
    super(props, context)

    this.bindDuplexRequests = this.bindDuplexRequests.bind(this)
    this.reject = this.reject.bind(this)
    this.rejectAll = this.rejectAll.bind(this)
    this.confirm = this.confirm.bind(this)

    this.state = {
      requests: [],
    }

    this.duplex = new Duplex.Popup()
  }

  async componentWillMount() {
    const requests = await popupMessanger.getRequestsWithUserInteraction()
    this.setState({ requests })
  }

  async confirm(request) {
    await popupMessanger.confirmRequest(request)
  }

  async reject(request) {
    await popupMessanger.rejectRequest(request)
  }

  rejectAll () {
    popupMessanger.rejectRequests()
  }

  bindDuplexRequests() {
    this.duplex.on('setRequests', requests => {
      this.setState({ requests })
    })
  }

  render() {

    const request = this.state.requests[0]

    if (request) {
      switch(request.method) {
        case 'prepareTransfers':
          return <ConfirmTransfers transfer={request}
            duplex={this.props.duplex}
            onConfirm={this.confirm}
            onReject={this.reject}/>
  
        default: return null
      }
    } else return <Loader/>
  } 
}

export default ConfirmRequest