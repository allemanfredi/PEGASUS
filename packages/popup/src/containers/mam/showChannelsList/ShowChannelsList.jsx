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
    const ownerChannels = Object.values(channels.owner).map(state => {
      state.ownership = 'owner'
      return state
    })
    const subscriberChannels = Object.values(channels.subscriber).map(state => {
      state.ownership = 'subscriber'
      return state
    })


    console.log(subscriberChannels, ownerChannels)
    this.setState({ channels: [...ownerChannels, ...subscriberChannels] })
  }

  render() {
    return (
      <React.Fragment>
        <div className="row mt-3">
          <div className="col-3 text-left text-xs text-gray">
            ownership
          </div>
          <div className="col-4 text-left text-xs text-gray">
            root
          </div>
          <div className="col-3 text-left text-xs text-gray">
            mode
          </div>
          <div className="col-2 text-right  text-xs text-gray">
            subsc.
          </div>
        </div>
        <hr className="mt-1 mb-1" />
        <div className="container-mam-channels">
          {
            this.state.channels.map((state, index) => {
              return <React.Fragment>
                <div className="row">
                  <div className="col-3 text-left text-gray my-auto">
                    {state.ownership}
                  </div>
                  <div className="col-4 text-left text-black text-xxs font-weight-bold my-auto">
                    {Utils.showAddress(state.root, 4, 6)}
                  </div>
                  <div className="col-3 text-left text-blue my-auto">
                    {state.channel.mode}
                  </div>
                  <div className="col-2 text-right text-gray my-auto">
                    {state.subscribed ? state.subscribed.length : '-'}
                  </div>
                </div>
                {
                  index !== this.state.channels.length - 1
                    ? <hr className="mt-1 mb-1" />
                    : null
                }
              </React.Fragment>
            })
          }
        </div>
      </React.Fragment>
    )
  }
}

export default ShowChannelsList