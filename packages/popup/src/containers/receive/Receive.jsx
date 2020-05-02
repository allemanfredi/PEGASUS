import React from 'react'
import AccountInfo from './accountInfo/AccountInfo'
import Buy from './buy/Buy'
import OptionsSelector from '../../components/optionsSelector/OptionsSelector'
import { RECEIVE_TEXT } from '../../texts'
import Faucet from './faucet/Faucet'

class Receive extends React.Component {
  constructor(props, context) {
    super(props, context)

    this.goBack = this.goBack.bind(this)

    this.state = {
      show: [false, false, false]
    }
  }

  goBack() {
    this.setState({
      show: [false, false, false]
    })
    this.props.onChangeCanGoBack(true)
    this.props.changeNavbarText('Receive')
  }

  render() {
    return (
      <div className="container overflow-auto-475h">
        {!this.state.show.includes(true) ? (
          <OptionsSelector
            items={RECEIVE_TEXT.items.filter(_item =>
              _item.networks.includes(this.props.network.type)
            )}
            onClick={({ text, index }) => {
              this.props.changeNavbarText(text)
              this.props.onChangeCanGoBack(null)
              this.setState(() => {
                const show = [false, false]
                show[index] = true
                return {
                  show
                }
              })
            }}
          />
        ) : null}
        {this.state.show[0] ? (
          <AccountInfo
            account={this.props.account}
            network={this.props.network}
            setNotification={this.props.setNotification}
          />
        ) : null}
        {this.state.show[1] && this.props.network.type === 'mainnet' ? (
          <Buy account={this.props.account} network={this.props.network} />
        ) : null}
        {this.state.show[1] &&
        (this.props.network.type === 'comnet' ||
          this.props.network.type === 'devnet') ? (
          <Faucet account={this.props.account} network={this.props.network} />
        ) : null}
      </div>
    )
  }
}

export default Receive
