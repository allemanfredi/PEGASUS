import React, { Component } from 'react'
import Duplex from '@pegasus/utils/duplex'
import { popupMessanger } from '@pegasus/utils/messangers'
import Header from './header/Header'
import Main from './main/Main'
import { APP_STATE } from '@pegasus/utils/states'
import Notifications from './notifications/Notifications'

class App extends Component {
  constructor(props, context) {
    super(props, context)

    this.main = React.createRef()
    this.header = React.createRef()

    this.onHandleLogin = this.onHandleLogin.bind(this)
    this.onShowHeader = this.onShowHeader.bind(this)
    this.onHandleNetworkChanging = this.onHandleNetworkChanging.bind(this)
    this.bindDuplexRequests = this.bindDuplexRequests.bind(this)
    this.onAddCustomNetwork = this.onAddCustomNetwork.bind(this)

    this.state = {
      isLogged: false,
      network: {},
      networks: [],
      account: {},
      showHeader: false
    }

    this.duplex = new Duplex.Popup()
  }

  async componentWillMount() {
    popupMessanger.init(this.duplex)
    this.bindDuplexRequests()

    //check if the current network has been already set, if no => set to testnet (options[0])
    const network = await popupMessanger.getCurrentNetwork()
    const networks = await popupMessanger.getAllNetworks()
    const account = await popupMessanger.getCurrentAccount()
    this.setState(() => {
      return account
        ? {
            network,
            networks,
            account
          }
        : {
            network,
            networks
          }
    })
  }

  onHandleLogin(value) {
    this.setState({ isLogged: value })
  }

  onShowHeader(value) {
    this.setState({ showHeader: value })
  }

  onHandleNetworkChanging(network) {
    popupMessanger.setCurrentNetwork(network)
  }

  async onAddCustomNetwork() {
    const state = await popupMessanger.getState()
    if (state >= APP_STATE.WALLET_UNLOCKED) this.main.current.addCustomNetwork()
  }

  bindDuplexRequests() {
    this.duplex.on('setTransfers', transfers =>
      this.main.current.changeTransfers(transfers)
    )
    this.duplex.on('setAccount', account => this.setState({ account }))
    this.duplex.on('setNetworks', networks => this.setState({ networks }))
    this.duplex.on('setNetwork', network => this.setState({ network }))
  }

  render() {
    return (
      <div className="app-wrapper">
        <div className="app chrome">
          {this.state.showHeader ? (
            <Header
              ref={this.header}
              account={this.state.account}
              network={this.state.network}
              networks={this.state.networks}
              isLogged={this.state.isLogged}
              changeNetwork={this.onHandleNetworkChanging}
              addCustomNetwork={this.onAddCustomNetwork}
            />
          ) : (
            ''
          )}
          <Notifications duplex={this.duplex}>
            <Main
              showHeader={this.onShowHeader}
              ref={this.main}
              network={this.state.network}
              account={this.state.account}
              duplex={this.duplex}
            />
          </Notifications>
        </div>
      </div>
    )
  }
}

export default App
