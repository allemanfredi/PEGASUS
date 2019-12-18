import React, { Component } from 'react'
import { popupMessanger } from '@pegasus/utils/messangers'
import Utils from '@pegasus/utils/utils'

class ShowChannelsList extends Component {
  constructor(props, context) {
    super(props, context)

    this.state = {
      channels: []
    }
  }

  async componentWillMount() {
    const channels = await popupMessanger.getMamChannels()
    console.log(channels)
    this.setState({ channels })
  }

  render() {
    return (
      <React.Fragment>

      </React.Fragment>
    )
  }
}

export default ShowChannelsList