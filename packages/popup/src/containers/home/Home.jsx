import React, { Component } from 'react'

import Send from '../send/Send'
import Receive from '../receive/Receive'
import Settings from '../settings/Settings'
import Transactions from '../transactions/Transactions'
import Add from '../add/Add'
import Network from '../network/Network'
import MamExplorer from '../mamExplorer/MamExplorer'
import ExportSeed from '../exportSeed/ExportSeed'
import ImportSeed from '../importSeed/ImportSeed'
import Loader from '../../components/loader/Loader'
import Navbar from '../../components/navbar/Navbar'
import Alert from '../../components/alert/Alert'
import { popupMessanger } from '@pegasus/utils/messangers'
import Utils from '@pegasus/utils/utils'
import Duplex from '@pegasus/utils/duplex'

class Home extends Component {
  constructor(props, context) {
    super(props, context)

    //transactions components
    this.transactions = React.createRef()

    this.onClickSend = this.onClickSend.bind(this)
    this.onClickSettings = this.onClickSettings.bind(this)
    this.onCloseSettings = this.onCloseSettings.bind(this)
    this.onClickReceive = this.onClickReceive.bind(this)
    this.onBack = this.onBack.bind(this)
    this.onSwitchAccount = this.onSwitchAccount.bind(this)
    this.onAddAccount = this.onAddAccount.bind(this)
    this.onLogout = this.onLogout.bind(this)
    this.onDeleteAccount = this.onDeleteAccount.bind(this)
    this.onReload = this.onReload.bind(this)
    this.onConfirm = this.onConfirm.bind(this)
    this.onExportSeed = this.onExportSeed.bind(this)
    this.onImportSeed = this.onImportSeed.bind(this)
    this.onAddNetwork = this.onAddNetwork.bind(this)
    this.onDeleteCurrentNetwork = this.onDeleteCurrentNetwork.bind(this)
    this.onMamExplorer = this.onMamExplorer.bind(this)

    this.state = {
      error: '',
      account: {},
      network: {},
      details: {}, //transaction selected from the table
      decryptedSeed: '',
      showSend: false,
      showHome: true,
      showReceive: false,
      showSettings: false,
      showNetwork: false,
      showAdd: false,
      showAlert: false,
      showMam: false,
      showExportSeed: false,
      showImportSeed: false,
      alertType: '',
      alertText: '',
      actionToConfirm: '',
      isLoading: false
    }

    this.duplex = new Duplex.Popup()
  }

  async componentWillMount() {
    this.duplex.on('setAccount', () => this.setState({
      isLoading: false
    }))
  }

  async onReload() {
    this.setState({
      isLoading: true
    })
    popupMessanger.reloadAccountData()
  }

  async onSwitchAccount(account) {
    popupMessanger.setCurrentAccount(account)
  }

  async onDeleteAccount() {
    this.setState(() => {
      return {
        showAlert: true,
        alertText: 'Are you sure you want delete this account?',
        alertType: 'confirm',
        actionToConfirm: 'deleteAccount'
      }
    })
  }

  onDeleteCurrentNetwork() {
    this.setState(() => {
      return {
        showAlert: true,
        alertText: 'Are you sure you want delete this node?',
        alertType: 'confirm',
        actionToConfirm: 'deleteNetwork'
      }
    })

  }

  onExportSeed() {
    this.setState({
      showExportSeed: true,
      showHome: false
    })
  }

  onImportSeed() {
    this.setState({
      showImportSeed: true,
      showHome: false
    })
  }

  async onConfirm() {
    switch (this.state.actionToConfirm) {
      case 'deleteAccount': {
        const account = await popupMessanger.deleteAccount(this.props.account)
        if (!account) {
          this.setState(() => {
            return {
              showAlert: true,
              alertText: 'Impossible to delete this account',
              alertType: 'error'
            }
          })
        } else this.setState({ showAlert: false })

        break
      }
      case 'deleteNetwork': {
        popupMessanger.deleteCurrentNetwork()
        this.setState({ showAlert: false })
        break
      }
    }

  }

  onClickSend() {
    this.setState(() => {
      return {
        showSend: true,
        showHome: false
      }
    })
  }

  onClickReceive() {
    this.setState(() => {
      return {
        showReceive: true,
        showHome: false
      }
    })
  }

  onBack() {
    this.setState(() => {
      return {
        showSend: false,
        showReceive: false,
        showDetails: false,
        showAlert: false,
        showAdd: false,
        showNetwork: false,
        showMam: false,
        showExportSeed: false,
        showImportSeed: false,
        showHome: true
      }
    })
  }

  onClickSettings() { 
    this.setState({ showSettings: true }) 
  }

  onCloseSettings() { 
    this.setState({ showSettings: false }) 
  }

  onAddAccount() {
    this.setState(() => {
      return {
        showAdd: true,
        showHome: false,
        showSettings: false
      }
    })
  }

  onLogout() { 
    this.props.onLogout() 
  }

  addCustomNetwork() {
    this.setState(() => {
      return {
        showHome: false,
        showNetwork: true
      }
    })
  }

  async onAddNetwork(network) {
    this.setState(() => {
      return {
        showNetwork: false,
        showHome: true
      }
    })
    await popupMessanger.addNetwork(network)
    await popupMessanger.setCurrentNetwork(network)
    await popupMessanger.getCurrentAccount()
  }

  onMamExplorer() {
    this.setState(() => {
      return {
        showMam: true,
        showHome: false,
        showSettings: false
      }
    })
  }

  render() {
    return (
      <div>
        <Navbar account={this.props.account}
          network={this.props.network}
          showBtnSettings={this.state.showHome}
          showBtnEllipse={this.state.showHome}
          showBtnBack={!this.state.showHome}
          text={this.state.showHome ? this.props.account.name : (this.state.showSend ? 'Send' : (this.state.showReceive ? 'Receive' : this.state.showAdd ? 'Add account' : (this.state.showNetwork ? 'Add custom node' : (this.state.showMam ? 'MAM Explorer' : (this.state.showExportSeed ? 'Export Seed ' : (this.state.showImportSeed ? 'Import Seed' : ''))))))}
          onClickSettings={this.onClickSettings}
          onClickMap={this.onClickMap}
          onBack={this.onBack}
          onDeleteAccount={this.onDeleteAccount}
          onViewAccountOnExplorer={this.onViewAccountOnExplorer}
          onExportSeed={this.onExportSeed}
          onImportSeed={this.onImportSeed}
          onDeleteCurrentNetwork={this.onDeleteCurrentNetwork}>
        </Navbar>
        {
          !(Object.keys(this.props.account).length === 0 && this.props.account.constructor === Object)
            ? <React.Fragment>
                {
                  this.state.showSettings 
                    ? <Settings network={this.props.network}
                        show={this.state.showSettings}
                        account={this.props.account}
                        onAddAccount={this.onAddAccount}
                        onSwitchAccount={this.onSwitchAccount}
                        onShowMap={this.onClickMap}
                        onLogout={this.onLogout}
                        onClose={this.onCloseSettings}
                        onMamExplorer={this.onMamExplorer} />
                    : ''
                }
                {
                  this.state.showSend
                    ? <Send account={this.props.account}
                        network={this.props.network}
                        onAskConfirm={() => this.props.onAskConfirm()} /> 
                    : ''
                }
                {
                  this.state.showReceive 
                    ? <Receive account={this.props.account}
                      network={this.state.network} /> 
                    : ''
                }
                {
                  this.state.showAdd
                    ? <Add network={this.props.network}
                        onBack={this.onBack} /> 
                    : ''
                }
                {
                  this.state.showNetwork
                    ? <Network onAddNetwork={this.onAddNetwork} /> 
                    : ''
                }
                {
                  this.state.showMam
                    ? <MamExplorer account={this.props.account}
                        network={this.props.network}
                        onBack={this.onBack} /> 
                    : ''
                }
                {
                  this.state.showExportSeed
                    ? <ExportSeed account={this.props.account}
                        network={this.props.network}
                        onBack={this.onBack} /> 
                    : ''
                }
                {
                  this.state.showImportSeed
                    ? <ImportSeed account={this.props.account}
                          rk={this.props.network}
                        onBack={this.onBack} /> 
                    : ''
                }
                {
                  this.state.showAlert
                    ? <Alert type={this.state.alertType}
                        text={this.state.alertText}
                        onClose={this.onBack}
                        onConfirm={this.onConfirm}/> 
                    : ''
                }
                {
                  this.state.showHome
                    ? <div>
                        <div className='row mt-4'>
                          <div className='col-12 text-center'>
                            <img src='./material/logo/iota-logo.png' height='60' width='60' alt='iota logo' />
                          </div>
                        </div>
                        <div className="row mt-1">
                          <div className='col-12 text-center text-black text-md'>
                            {
                              Utils.iotaReducer(
                              this.props.account.data.balance[this.props.network.type]
                                ? this.props.account.data.balance[this.props.network.type]
                                : 0
                              )
                            }
                          </div>
                        </div>
                        <div className='row mt-1 mb-4'>
                          <div className="col-2"></div>
                          <div className='col-4 text-center'>
                            <button onClick={this.onClickReceive} className='btn btn-border-blue btn-big'>Receive</button>
                          </div>
                          <div className='col-4 text-center'>
                            <button onClick={this.onClickSend} className='btn btn-border-blue btn-big'>Send</button>
                          </div>
                          <div className="col-2"></div>
                        </div>
                        <Transactions ref={this.transactions}
                          account={this.props.account}
                          network={this.props.network}
                          isLoading={this.state.isLoading}
                          onReload={this.onReload}
                        />
                      </div>
                    : ''
                }
              </React.Fragment>
            : <Loader />
        }
      </div>
    )
  }
}

export default Home