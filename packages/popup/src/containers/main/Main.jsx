import React, { Component } from 'react'
import Home from '../home/Home'
import Login from '../login/Login'
import Init from '../init/Init'
import Restore from '../restore/Restore'
import Confirm from '../confirm/Confirm'
import Connector from '../connector/Connector'
import Duplex from '@pegasus/utils/duplex'
import { popupMessanger } from '@pegasus/utils/messangers'
import { APP_STATE } from '@pegasus/utils/states'

class Main extends Component {
  constructor(props, context) {
    super(props, context)

    this.bindDuplexRequests = this.bindDuplexRequests.bind(this)
    this.onSuccessFromInit = this.onSuccessFromInit.bind(this)
    this.onSuccessFromLogin = this.onSuccessFromLogin.bind(this)
    this.onSuccessFromRestore = this.onSuccessFromRestore.bind(this)
    this.onLogout = this.onLogout.bind(this)
    this.onRestore = this.onRestore.bind(this)
    this.onBack = this.onBack.bind(this)
    this.onRejectAll = this.onRejectAll.bind(this)
    this.onAskConfirm = this.onAskConfirm.bind(this)
    this.onNotConfirms = this.onNotConfirms.bind(this)
    this.onPermissionGranted = this.onPermissionGranted.bind(this)
    this.onPermissionNotGranted = this.onPermissionNotGranted.bind(this)

    this.home = React.createRef()
    this.confirm = React.createRef()
    this.connector = React.createRef()

    this.state = {
      appState: APP_STATE.WALLET_WITHOUT_STATE,
      duplex: new Duplex.Popup(),
    }
  }

  async componentDidMount() {
    await popupMessanger.checkSession()
    let state = await popupMessanger.getState()
    if (state >= APP_STATE.WALLET_LOCKED) {
      this.props.showHeader(true)
    }
    if (state >= APP_STATE.WALLET_UNLOCKED) {
      popupMessanger.startHandleAccountData()
    }
    if (state === APP_STATE.WALLET_REQUEST_PERMISSION_OF_CONNECTION)
      this.props.showHeader(false)

    if (state === APP_STATE.WALLET_TRANSFERS_IN_QUEUE)
      this.props.showHeader(false)

    const requests = await popupMessanger.getRequests()
    //impossible to load data from the storage until that a user log in
    if (state >= APP_STATE.WALLET_UNLOCKED) {

      const website = await popupMessanger.getWebsite()
      const connection = await popupMessanger.getConnection(website ? website.origin : 'offline')

      if (connection) {
        if (connection.requestToConnect === true && state >= APP_STATE.WALLET_UNLOCKED) {
          this.props.showHeader(false)
          state = APP_STATE.WALLET_REQUEST_PERMISSION_OF_CONNECTION 
        }
      }

      if (!connection && state === APP_STATE.WALLET_TRANSFERS_IN_QUEUE) {
        this.props.showHeader(false)
        state = APP_STATE.WALLET_REQUEST_PERMISSION_OF_CONNECTION 
      }

      if (
        !connection &&
        state >= APP_STATE.WALLET_UNLOCKED &&
        requests.length > 0
      ) {
        this.props.showHeader(false)
        state = APP_STATE.WALLET_REQUEST_PERMISSION_OF_CONNECTION 
      }
    }
    
    this.setState({ appState: state })
    this.bindDuplexRequests()
  }

  bindDuplexRequests() {
    this.state.duplex.on('setAppState', appState => {
      console.log("ne st", appState)
      this.setState({ appState })
      if (appState > APP_STATE.WALLET_LOCKED)
        this.props.showHeader(true)
      else this.props.showHeader(false)
    })
  }

  async onSuccessFromLogin() {
    popupMessanger.startSession()
    popupMessanger.setState(APP_STATE.WALLET_UNLOCKED)

    const website = await popupMessanger.getWebsite()
    const connection = await popupMessanger.getConnection(website ? website.origin : 'offline')
    const transfers = await popupMessanger.getTransfers()
    const requests = await popupMessanger.getRequests()
    
    //no connections but request from injection with wallet locked
    if (!connection && (transfers.length > 0 || requests.length > 0)) {
      popupMessanger.updateConnection({
        website,
        requestToConnect: true,
        connected: false,
        enabled: false
      })
      this.props.showHeader(false)
      this.setState({ appState: APP_STATE.WALLET_REQUEST_PERMISSION_OF_CONNECTION })
      popupMessanger.setState(APP_STATE.WALLET_REQUEST_PERMISSION_OF_CONNECTION)
      return
    } 

    //unlocked and no injection requests
    else if ((!connection || connection.enabled) && transfers.length === 0 && requests.length === 0){
      popupMessanger.startHandleAccountData()
      this.props.showHeader(true)
      this.setState({ appState: APP_STATE.WALLET_UNLOCKED })
      return
    }

    //.connect() with wallet locked
    else if (connection.requestToConnect === true) {
      this.props.showHeader(false)
      this.setState({ appState: APP_STATE.WALLET_REQUEST_PERMISSION_OF_CONNECTION })
      popupMessanger.setState(APP_STATE.WALLET_REQUEST_PERMISSION_OF_CONNECTION)
      return
    } 

    else if (transfers.length > 0) {
      this.props.showHeader(false)
      this.setState({ appState: APP_STATE.WALLET_TRANSFERS_IN_QUEUE })
      popupMessanger.setState(APP_STATE.WALLET_TRANSFERS_IN_QUEUE)
      this.changeTransfers(transfers)
      return
    } 

    else if (connection.enabled === true){
      popupMessanger.closePopup()
      popupMessanger.executeRequests()
    }
  }

  async onPermissionGranted() {
    const transfers = await popupMessanger.getTransfers()
    const website = await popupMessanger.getWebsite()
    popupMessanger.pushConnection({
      website,
      requestToConnect: false,
      connected: true,
      enabled: true
    })
    
    await popupMessanger.completeConnection()
    if (transfers.length > 0) {
      this.props.showHeader(false)
      this.setState({ appState: APP_STATE.WALLET_TRANSFERS_IN_QUEUE })
      popupMessanger.setState(APP_STATE.WALLET_TRANSFERS_IN_QUEUE)
      this.changeTransfers(transfers)
      return
    } else {
      popupMessanger.closePopup()
      popupMessanger.executeRequests()
    }
    this.props.showHeader(true)
    this.setState({ appState: APP_STATE.WALLET_UNLOCKED })
  }

  async onPermissionNotGranted() {
    const website = await popupMessanger.getWebsite()
    popupMessanger.updateConnection({
      website,
      requestToConnect: true,
      connected: false,
      enabled: false
    })
    popupMessanger.rejectConnection()
    popupMessanger.rejectRequests()
    this.props.showHeader(true)
    this.setState({ appState: APP_STATE.WALLET_UNLOCKED })
  }

  onSuccessFromInit() {
    this.props.showHeader(true)
    this.setState({ appState: APP_STATE.WALLET_UNLOCKED })
    popupMessanger.startHandleAccountData()
    popupMessanger.setState(APP_STATE.WALLET_UNLOCKED)
    popupMessanger.startSession()
  }

  onSuccessFromRestore() {
    this.props.showHeader(true)
    this.setState({ appState: APP_STATE.WALLET_UNLOCKED })
    popupMessanger.setState(APP_STATE.WALLET_UNLOCKED)
    popupMessanger.startHandleAccountData()
    popupMessanger.startSession()
  }

  onLogout() {
    popupMessanger.deleteSession()
    popupMessanger.stopHandleAccountData()
    this.props.showHeader(true)
    this.setState({ appState: APP_STATE.WALLET_LOCKED })
    popupMessanger.setState(APP_STATE.WALLET_LOCKED)
  }

  onRestore() {
    this.props.showHeader(true)
    this.setState({ appState: APP_STATE.WALLET_RESTORE })
    popupMessanger.setState(APP_STATE.WALLET_RESTORE)
  }

  onBack() {
    this.setState({ appState: APP_STATE.WALLET_LOCKED })
    popupMessanger.setState(APP_STATE.WALLET_LOCKED)
  }

  onRejectAll() {
    this.props.showHeader(true)
    this.setState({ appState: APP_STATE.WALLET_UNLOCKED })
    popupMessanger.rejectAllTransfers()
  }

  onNotConfirms() {
    this.props.showHeader(true)
    this.setState({ appState: APP_STATE.WALLET_UNLOCKED })
  }

  //duplex function
  changeTransfers(transfers) {
    this.confirm.current.changeTransfers(transfers)
  }

  setConfirmationLoading(isLoading) {
    this.confirm.current.setConfirmationLoading(isLoading)
  }

  setConfirmationError(error) {
    this.confirm.current.setConfirmationError(error)
  }

  onAskConfirm() {
    this.props.showHeader(false)
    this.setState({ appState: APP_STATE.WALLET_TRANSFERS_IN_QUEUE })
    popupMessanger.setState(APP_STATE.WALLET_TRANSFERS_IN_QUEUE)
  }

  //add network
  addCustomNetwork() {
    this.home.current.addCustomNetwork()
  }

  render() {
    switch (this.state.appState) {
      case APP_STATE.WALLET_NOT_INITIALIZED:
        return <Init onSuccess={this.onSuccessFromInit} />
      case APP_STATE.WALLET_LOCKED:
        return <Login onSuccess={this.onSuccessFromLogin}
                  onRestore={this.onRestore} />
      case APP_STATE.WALLET_RESTORE:
        return <Restore network={this.props.network} 
                  onSuccess={this.onSuccessFromRestore}
                  onBack={this.onBack}/>
      case APP_STATE.WALLET_UNLOCKED:
        return <Home ref={this.home} 
                  account={this.props.account} 
                  network={this.props.network} 
                  onLogout={this.onLogout} 
                  onAskConfirm={this.onAskConfirm}/>
      case APP_STATE.WALLET_TRANSFERS_IN_QUEUE:
        return <Confirm ref={this.confirm} 
                  onNotConfirms={this.onNotConfirms}
                  onRejectAll={this.onRejectAll} />
      case APP_STATE.WALLET_REQUEST_PERMISSION_OF_CONNECTION:
        return <Connector ref={this.connector} 
                  onPermissionGranted={this.onPermissionGranted}
                  onPermissionNotGranted={this.onPermissionNotGranted} />
      default:
        return ''
    }
  }
}

export default Main