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

    this.onShowHeader = this.onShowHeader.bind(this)
    this.onHandleNetworkChanging = this.onHandleNetworkChanging.bind(this)
    this.bindStateUpdate = this.bindStateUpdate.bind(this)
    this.onAddCustomNetwork = this.onAddCustomNetwork.bind(this)

    this.state = {
      isLogged: false,
      network: {},
      networks: [],
      account: {},
      showHeader: false,
      appState: 0
    }
  }

  async componentWillMount() {
    this.bindStateUpdate()

    const network = await this.props.background.getCurrentNetwork()
    const networks = await this.props.background.getAllNetworks()
    const account = await this.props.background.getCurrentAccount()
    const appState = await this.props.background.getState()

    this.setState({
      network,
      networks,
      account: account ? account : null,
      appState
    })
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
      const { state, accounts, selectedNetwork, networks } = backgroundState

      if (
        state > APP_STATE.WALLET_LOCKED &&
        state !== APP_STATE.WALLET_RESTORE
      ) {
        if (
          accounts &&
          accounts.selected &&
          Object.keys(accounts.selected).length > 0
        ) {
          this.setState({ account: accounts.selected })
        }
      }

      if (
        state >= APP_STATE.WALLET_LOCKED ||
        state === APP_STATE.WALLET_RESTORE
      )
        this.setState({ showHeader: true })
      else this.setState({ showHeader: false })

      if (
        state === APP_STATE.WALLET_REQUEST_IN_QUEUE_WITH_USER_INTERACTION ||
        state === APP_STATE.WALLET_REQUEST_PERMISSION_OF_CONNECTION
      )
        this.setState({ showHeader: false })

      this.setState({
        network: selectedNetwork,
        networks: networks,
        appState:
          state !== APP_STATE.WALLET_RESTORE ? state : this.state.appState
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
              background={this.props.background}
              networks={this.state.networks}
              appState={this.state.appState}
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
