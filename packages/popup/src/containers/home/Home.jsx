import React, { Component } from 'react'
import Send from '../send/Send'
import Receive from '../receive/Receive'
import Menu from '../menu/Menu'
import Transactions from '../transactions/Transactions'
import Add from '../add/Add'
import Network from '../network/Network'
import ExportSeed from '../exportSeed/ExportSeed'
import ImportSeed from '../importSeed/ImportSeed'
import Mam from '../mam/Mam'
import Loader from '../../components/loader/Loader'
import Navbar from '../../components/navbar/Navbar'
import Alert from '../../components/alert/Alert'
import Settings from '../settings/Settings'
import { popupMessanger } from '@pegasus/utils/messangers'
import Utils from '@pegasus/utils/utils'
import ReactTooltip from 'react-tooltip'

class Home extends Component {
  constructor(props, context) {
    super(props, context)

    this.mam = React.createRef()
    this.exportSeed = React.createRef()
    this.settings = React.createRef()

    this.onClickSend = this.onClickSend.bind(this)
    this.onClickMenu = this.onClickMenu.bind(this)
    this.onCloseMenu = this.onCloseMenu.bind(this)
    this.onClickReceive = this.onClickReceive.bind(this)
    this.onBack = this.onBack.bind(this)
    this.onAddAccount = this.onAddAccount.bind(this)
    this.onLogout = this.onLogout.bind(this)
    this.onDeleteAccount = this.onDeleteAccount.bind(this)
    this.onReload = this.onReload.bind(this)
    this.onConfirm = this.onConfirm.bind(this)
    this.onExportSeed = this.onExportSeed.bind(this)
    this.onImportSeed = this.onImportSeed.bind(this)
    this.onDeleteCurrentNetwork = this.onDeleteCurrentNetwork.bind(this)
    this.onMam = this.onMam.bind(this)
    this.onSettings = this.onSettings.bind(this)
    this.copyToClipboard = this.copyToClipboard.bind(this)

    this.state = {
      error: '',
      account: {},
      network: {},
      details: {},
      decryptedSeed: '',
      showSend: false,
      showHome: true,
      showReceive: false,
      showMenu: false,
      showNetwork: false,
      showAdd: false,
      showAlert: false,
      showExportSeed: false,
      showImportSeed: false,
      showMamChannels: false,
      showSettings: false,
      showNavbar: true,
      alertType: '',
      alertText: '',
      actionToConfirm: '',
      isLoading: false,
      canGoBack: true,
      isCopiedToClipboard: false,
      navbarText: ''
    }
  }

  async componentWillMount() {
    this.props.duplex.on('setAccount', () =>
      this.setState({
        isLoading: false
      })
    )
  }

  async onReload() {
    this.setState({
      isLoading: true
    })
    popupMessanger.reloadAccountData()
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
      showHome: false,
      navbarText: 'Export Seed'
    })
  }

  onImportSeed() {
    this.setState({
      showImportSeed: true,
      showHome: false,
      navbarText: 'Import Account'
    })
  }

  async onConfirm() {
    this.setState({ showAlert: false })

    switch (this.state.actionToConfirm) {
      case 'deleteAccount': {
        const isDeleted = await popupMessanger.deleteAccount(this.props.account)
        if (!isDeleted) {
          this.props.setNotification({
            type: 'danger',
            text: 'Impossible to delete the account!',
            position: 'under-bar'
          })
        } else {
          this.props.setNotification({
            type: 'success',
            text: 'Account Deleted Succesfully!',
            position: 'under-bar'
          })
        }
        break
      }
      case 'deleteNetwork': {
        popupMessanger.deleteCurrentNetwork()
        this.props.setNotification({
          type: 'success',
          text: 'Network Deleted Succesfully!',
          position: 'under-bar'
        })
        break
      }
      default:
        break
    }
  }

  onClickSend() {
    this.setState(() => {
      return {
        showSend: true,
        showHome: false,
        navbarText: 'Send'
      }
    })
  }

  onClickReceive() {
    this.setState(() => {
      return {
        showReceive: true,
        showHome: false,
        navbarText: 'Receive'
      }
    })
  }

  onBack() {
    if (!this.state.canGoBack) {
      if (this.mam.current) this.mam.current.goBack()
      if (this.exportSeed.current) this.exportSeed.current.goBack()
      if (this.settings.current) this.settings.current.goBack()
      return
    }

    this.setState(() => {
      return {
        showSend: false,
        showReceive: false,
        showDetails: false,
        showAlert: false,
        showAdd: false,
        showNetwork: false,
        showMamExplorer: false,
        showExportSeed: false,
        showImportSeed: false,
        showMamChannels: false,
        showSettings: false,
        showHome: true
      }
    })

    this.setState({ navbarText: '' })
  }

  addCustomNetwork() {
    this.setState(() => {
      return {
        showHome: false,
        showNetwork: true
      }
    })
  }

  onClickMenu() {
    this.setState({ showMenu: true })
  }

  onCloseMenu() {
    this.setState({ showMenu: false })
  }

  onAddAccount() {
    this.setState(() => {
      return {
        showAdd: true,
        showHome: false,
        showMenu: false,
        navbarText: 'Add Account'
      }
    })
  }

  onLogout() {
    this.props.onLogout()
    popupMessanger.lockWallet()
  }

  onMam() {
    this.setState(() => {
      return {
        showMamChannels: true,
        showHome: false,
        showMenu: false,
        navbarText: 'MAM'
      }
    })
  }

  onSettings() {
    this.setState(() => {
      return {
        showSettings: true,
        showHome: false,
        showMenu: false,
        navbarText: 'Settings'
      }
    })
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
      <div>
        {this.state.showNavbar ? (
          <Navbar
            account={this.props.account}
            network={this.props.network}
            showBtnSettings={this.state.showHome}
            showBtnEllipse={this.state.showHome}
            showBtnBack={!this.state.showHome}
            text={
              this.state.showHome
                ? this.props.account.name
                : this.state.navbarText
            }
            onClickMenu={this.onClickMenu}
            onClickMap={this.onClickMap}
            onBack={this.onBack}
            onDeleteAccount={this.onDeleteAccount}
            onAddAccount={this.onAddAccount}
            onViewAccountOnExplorer={this.onViewAccountOnExplorer}
            onExportSeed={this.onExportSeed}
            onImportSeed={this.onImportSeed}
            onDeleteCurrentNetwork={this.onDeleteCurrentNetwork}
            onShowSettings={this.onShowSettings}
          ></Navbar>
        ) : null}
        {!(
          Object.keys(this.props.account).length === 0 &&
          this.props.account.constructor === Object
        ) ? (
          <React.Fragment>
            {this.state.showMenu ? (
              <Menu
                network={this.props.network}
                show={this.state.showMenu}
                account={this.props.account}
                onSwitchAccount={this.onSwitchAccount}
                onShowMap={this.onClickMap}
                onLogout={this.onLogout}
                onClose={this.onCloseMenu}
                onMam={this.onMam}
                onSettings={this.onSettings}
              />
            ) : (
              ''
            )}
            {this.state.showSend ? (
              <Send
                account={this.props.account}
                duplex={this.props.duplex}
                network={this.props.network}
                setNotification={this.props.setNotification}
                onBack={this.onBack}
                onHideTop={show => {
                  this.props.onShowHeader(!show)
                  this.setState({ showNavbar: !show })
                }}
              />
            ) : (
              ''
            )}
            {this.state.showReceive ? (
              <Receive
                account={this.props.account}
                network={this.state.network}
                setNotification={this.props.setNotification}
              />
            ) : (
              ''
            )}
            {this.state.showAdd ? (
              <Add
                network={this.props.network}
                setNotification={this.props.setNotification}
                onBack={this.onBack}
              />
            ) : (
              ''
            )}
            {this.state.showNetwork ? (
              <Network
                setNotification={this.props.setNotification}
                onBack={this.onBack}
              />
            ) : (
              ''
            )}
            {this.state.showExportSeed ? (
              <ExportSeed
                ref={this.exportSeed}
                account={this.props.account}
                network={this.props.network}
                setNotification={this.props.setNotification}
                onChangeCanGoBack={value => this.setState({ canGoBack: value })}
                onBack={this.onBack}
              />
            ) : (
              ''
            )}
            {this.state.showImportSeed ? (
              <ImportSeed
                setNotification={this.props.setNotification}
                account={this.props.account}
                network={this.props.network}
                onBack={this.onBack}
              />
            ) : (
              ''
            )}
            {this.state.showMamChannels ? (
              <Mam
                ref={this.mam}
                account={this.props.account}
                duplex={this.props.duplex}
                changeNavbarText={navbarText => this.setState({ navbarText })}
                onBack={this.onBack}
                onChangeCanGoBack={value => this.setState({ canGoBack: value })}
              />
            ) : (
              ''
            )}
            {this.state.showSettings ? (
              <Settings
                ref={this.settings}
                setNotification={this.props.setNotification}
                changeNavbarText={navbarText => this.setState({ navbarText })}
                onBack={this.onBack}
                onChangeCanGoBack={value => this.setState({ canGoBack: value })}
              />
            ) : (
              ''
            )}
            {this.state.showAlert ? (
              <Alert
                type={this.state.alertType}
                text={this.state.alertText}
                onClose={this.onBack}
                onConfirm={this.onConfirm}
              />
            ) : (
              ''
            )}
            {this.state.showHome ? (
              <div className="container">
                <div className="row mt-3 mb-2">
                  <div className="col-4 text-left">
                    <img
                      src="./material/logo/iota-logo.png"
                      height="40"
                      width="40"
                      alt="iota logo"
                    />
                  </div>
                  <div
                    onClick={() => {
                      this.copyToClipboard(
                        Utils.checksummed(this.props.account.data.latestAddress)
                      )
                    }}
                    className="col-4 my-auto text-center text-xs font-weight-bold cursor-pointer pt-3 pb-3 gray-on-hover-with-border-radius"
                    data-tip={
                      this.state.isCopiedToClipboard
                        ? 'copied!'
                        : 'copy to clipboard'
                    }
                    key={
                      this.state.isCopiedToClipboard
                        ? 'copied'
                        : 'copy-to-clipboard'
                    }
                  >
                    <ReactTooltip />
                    {Utils.showAddress(
                      Utils.checksummed(this.props.account.data.latestAddress),
                      4,
                      6
                    )}
                  </div>
                  <div className="col-4 text-right text-black text-lg my-auto">
                    {Utils.iotaReducer(
                      this.props.account.data.balance[this.props.network.type]
                        ? this.props.account.data.balance[
                            this.props.network.type
                          ]
                        : 0
                    )}
                  </div>
                </div>
                <Transactions
                  account={this.props.account}
                  network={this.props.network}
                  isLoading={this.state.isLoading}
                  setNotification={this.props.setNotification}
                  onReload={this.onReload}
                />
                <div className="row mt-3">
                  <div className="col-6 text-center">
                    <button
                      onClick={this.onClickReceive}
                      className="btn btn-border-blue btn-big"
                    >
                      Receive
                    </button>
                  </div>
                  <div className="col-6 text-center">
                    <button
                      onClick={this.onClickSend}
                      className="btn btn-border-blue btn-big"
                    >
                      Send
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              ''
            )}
          </React.Fragment>
        ) : (
          <Loader />
        )}
      </div>
    )
  }
}

export default Home
