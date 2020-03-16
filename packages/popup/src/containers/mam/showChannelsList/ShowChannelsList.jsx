import React, { Component } from 'react'
import Utils from '@pegasus/utils/utils'
import ReactTooltip from 'react-tooltip'

class ShowChannelsList extends Component {
  constructor(props, context) {
    super(props, context)

    this.copyToClipboard = this.copyToClipboard.bind(this)

    this.state = {
      channels: [],
      isCopiedToClipboard: false
    }
  }

  async componentWillMount() {
    const channels = await this.props.background.getMamChannels()

    if (!channels || Utils.isEmptyObject(channels)) {
      return
    }

    if (channels.owner) {
      const ownerChannels = Object.values(channels.owner).map(state => {
        state.ownership = 'owner'
        return state
      })
      this.setState({ channels: [...ownerChannels] })
    }

    if (channels.subscriber) {
      const subscriberChannels = Object.values(channels.subscriber).map(
        state => {
          state.ownership = 'subscriber'
          return state
        }
      )
      this.setState({
        channels: [...this.state.channels, ...subscriberChannels]
      })
    }
  }

  copyToClipboard(text) {
    const textField = document.createElement('textarea')
    textField.innerText = text
    document.body.appendChild(textField)
    textField.select()
    document.execCommand('copy')
    textField.remove()

    this.setState({ isCopiedToClipboard: true })
    setTimeout(() => {
      this.setState({ isCopiedToClipboard: false })
    }, 1000)
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
          {this.state.channels.map((state, index) => {
            return (
              <React.Fragment>
                <div className="row">
                  <div className="col-3 text-left text-xxs text-gray my-auto">
                    {state.ownership}
                  </div>
                  <div
                    className="col-4 text-left text-black text-xxs font-weight-bold my-auto cursor-pointer"
                    onClick={() => {
                      this.copyToClipboard(state.root)
                    }}
                    key={
                      this.state.isCopiedToClipboard
                        ? 'copied'
                        : 'copy-to-clipboard'
                    }
                    data-tip={
                      this.state.isCopiedToClipboard
                        ? 'copied!'
                        : 'copy to clipboard'
                    }
                  >
                    <ReactTooltip />
                    {Utils.showAddress(state.root, 4, 6)}
                  </div>
                  <div className="col-3 text-left text-blue my-auto">
                    {state.channel.mode}
                  </div>
                  <div className="col-2 text-right text-gray my-auto">
                    {state.subscribed ? state.subscribed.length : '-'}
                  </div>
                </div>
                {index !== this.state.channels.length - 1 ? (
                  <hr className="mt-1 mb-1" />
                ) : null}
              </React.Fragment>
            )
          })}
        </div>
      </React.Fragment>
    )
  }
}

export default ShowChannelsList
