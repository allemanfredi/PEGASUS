import React, { Component } from 'react'
import Duplex from '@pegasus/utils/duplex'
import { popupMessanger } from '@pegasus/utils/messangers'
import IOTA from '@pegasus/utils/iota'
import Header from './header/Header'
import Main from './main/Main'
import { APP_STATE } from '@pegasus/utils/states'

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
      showHeader: false,
    }

    this.duplex = new Duplex.Popup()
  }

  async componentWillMount() {
    popupMessanger.init(this.duplex)
    this.bindDuplexRequests()

    //check if the current network has been already set, if no => set to testnet (options[0])
    const network = await popupMessanger.getCurrentNetwork()
    const networks = await popupMessanger.getAllNetworks()
    IOTA.init(network.provider)
    this.setState(() => {
      return {
        network,
        networks
      }
    })
  }

  //when user stop to use the extension, background will save the data in the local storage
  componentWillUnmount() {
    popupMessanger.writeDataOnLocalStorage()
  }

  onHandleLogin(value) {
    this.setState({ isLogged: value })
  }

  onShowHeader(value) {
    this.setState({ showHeader: value })
  }

  onHandleNetworkChanging(network) {
    IOTA.setProvider(network.provider)
    popupMessanger.setCurrentNetwork(network)

    //transactions handler for new network
    popupMessanger.stopHandleAccountData()
    popupMessanger.startHandleAccountData()
  }

  async onAddCustomNetwork() {
    const state = await popupMessanger.getState()
    if (state >= APP_STATE.WALLET_UNLOCKED)
      this.main.current.addCustomNetwork()
  }

  bindDuplexRequests() {
    this.duplex.on('setTransfers', transfers => this.main.current.changeTransfers(transfers))
    this.duplex.on('setAccount', account => this.setState({ account }))
    this.duplex.on('setNetworks', networks => this.setState({ networks }))
    this.duplex.on('setNetwork', network => this.setState({ network }))
  }

  render() {
    return (
      <div className="app-wrapper">
        <div className="app chrome">
          {
            this.state.showHeader ? 
              <Header ref={this.header}
                account={this.state.account}
                network={this.state.network}
                networks={this.state.networks}
                isLogged={this.state.isLogged}
                changeNetwork={this.onHandleNetworkChanging}
                addCustomNetwork={this.onAddCustomNetwork} /> 
            : ''
          }
          <Main showHeader={this.onShowHeader}
            ref={this.main}
            network={this.state.network}
            account={this.state.account}
            duplex={this.duplex}/>
        </div>
      </div>
    )
  }
}

export default App