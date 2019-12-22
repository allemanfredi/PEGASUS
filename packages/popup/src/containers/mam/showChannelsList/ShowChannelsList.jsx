import React, { Component } from 'react'
import { popupMessanger } from '@pegasus/utils/messangers'
import Utils from '@pegasus/utils/utils'
import ReactTooltip from 'react-tooltip'

class ShowChannelsList extends Component {
  constructor(props, context) {
    super(props, context)

    this.copyToClipboard = this.copyToClipboard.bind(this)

    this.state = {
      channels: [],
      copyToClipboardText: 'copy to clipboard',
    }
    
    this.tooltipRefs = []
  }

  async componentWillMount() {
    const channels = await popupMessanger.getMamChannels()

    if (!channels || Utils.isEmptyObject(channels))
      return
    
    if (channels.owner) {
      const ownerChannels = Object.values(channels.owner).map(state => {
        state.ownership = 'owner'
        return state
      })
      this.setState({ channels: [...ownerChannels] })
    }
    
    if (channels.subscriber) {
      const subscriberChannels = Object.values(channels.subscriber).map(state => {
        state.ownership = 'subscriber'
        return state
      })
      this.setState({ channels: [...subscriberChannels] })
    }
  }

  copyToClipboard(text, index) {
    const textField = document.createElement('textarea')
    textField.innerText = text
    document.body.appendChild(textField)
    textField.select()
    document.execCommand('copy')
    textField.remove()


    setTimeout(() => {
      ReactTooltip.hide(this.tooltipRefs[index])
      this.setState({copyToClipboardText : 'copy to clipboard'})
    },1500)
  }

  render() {
    return (
      <React.Fragment>
        <div className="row mt-3">
          <div className="col-3 text-left text-xs text-black font-weight-bold">
            ownership
          </div>
          <div className="col-4 text-left text-xs text-black font-weight-bold">
            root
          </div>
          <div className="col-3 text-left text-xs text-black font-weight-bold">
            mode
          </div>
          <div className="col-2 text-right  text-xs text-black font-weight-bold">
            subsc.
          </div>
        </div>
        <hr className="mt-1 mb-1" />
        <div className="container-mam-channels">
          {
            this.state.channels.map((state, index) => {
              return <React.Fragment>
                <ReactTooltip/>
                <div className="row">
                  <div className="col-3 text-left text-xxs text-gray my-auto">
                    {state.ownership}
                  </div>
                  <div className="col-4 text-left text-black text-xxs font-weight-bold my-auto cursor-pointer"
                    onClick={() => {
                      this.setState({copyToClipboardText : 'copied'})
                      this.copyToClipboard(state.root, index)
                    }}
                    data-tip={this.state.copyToClipboardText}
                    ref={ref => this.tooltipRefs[index] = ref}
                  >
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