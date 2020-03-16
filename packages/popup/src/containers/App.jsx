import React, { Component } from 'react'
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
    this.bindStateUpdate = this.bindStateUpdate.bind(this)
    this.onAddCustomNetwork = this.onAddCustomNetwork.bind(this)

    this.state = {
      isLogged: false,
      network: {},
      networks: [],
      account: {},
      showHeader: false
    }

    //this.duplex = new Duplex.Popup()
  }

  async componentWillMount() {
    this.bindStateUpdate()

    //check if the current network has been already set, if no => set to testnet (options[0])
    const network = await this.props.background.getCurrentNetwork()
    const networks = await this.props.background.getAllNetworks()
    const account = await this.props.background.getCurrentAccount()

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
    this.props.background.setCurrentNetwork(network)
  }

  async onAddCustomNetwork() {
    const state = await this.props.background.getState()
    if (state >= APP_STATE.WALLET_UNLOCKED) this.main.current.addCustomNetwork()
  }

  bindStateUpdate() {
    this.props.background.on('update', backgroundState => {
      if (backgroundState.state > APP_STATE.WALLET_LOCKED) {
        const currentAccount = backgroundState.accounts.find(
          account => account.current
        )
        this.setState({ account: currentAccount })
      }

      this.setState({
        network: backgroundState.selectedNetwork,
        networks: backgroundState.networks
      })
    })
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
          {
            <Notifications background={this.props.background}>
              <Main
                showHeader={this.onShowHeader}
                ref={this.main}
                network={this.state.network}
                account={this.state.account}
                background={this.props.background}
              />
            </Notifications>
          }
        </div>
      </div>
    )
  }
}

export default App
