import React, { Component } from 'react'
import Home from '../home/Home'
import Login from '../login/Login'
import Init from '../init/Init'
import Restore from '../restore/Restore'
import ConfirmRequest from '../confirm/ConfirmRequest'
import Connector from '../connector/Connector'
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
    this.onPermissionGranted = this.onPermissionGranted.bind(this)
    this.onPermissionNotGranted = this.onPermissionNotGranted.bind(this)

    this.home = React.createRef()
    this.connector = React.createRef()

    this.state = {
      appState: APP_STATE.WALLET_WITHOUT_STATE
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
    if (state === APP_STATE.WALLET_REQUEST_IN_QUEUE_WITH_USER_INTERACTION)
      this.props.showHeader(false)

    const requests = await popupMessanger.getRequests()
    const requestsWithUserInteraction = await popupMessanger.getRequestsWithUserInteraction()

    //impossible to load data from the storage until that a user log in
    if (state >= APP_STATE.WALLET_UNLOCKED) {
      const account = await popupMessanger.getCurrentAccount()
      const website = await popupMessanger.getWebsite()
      const connection = await popupMessanger.getConnection(
        website ? website.origin : 'offline',
        account.id
      )

      if (connection) {
        if (
          connection.requestToConnect === true &&
          state >= APP_STATE.WALLET_UNLOCKED
        ) {
          this.props.showHeader(false)
          state = APP_STATE.WALLET_REQUEST_PERMISSION_OF_CONNECTION
        }

        if (
          connection.enabled === true &&
          requestsWithUserInteraction.length > 0
        ) {
          this.props.showHeader(false)
          state = APP_STATE.WALLET_REQUEST_IN_QUEUE_WITH_USER_INTERACTION
          popupMessanger.setState(
            APP_STATE.WALLET_REQUEST_IN_QUEUE_WITH_USER_INTERACTION
          )
        }
      }

      if (
        !connection &&
        state === APP_STATE.WALLET_REQUEST_IN_QUEUE_WITH_USER_INTERACTION
      ) {
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
    this.props.duplex.on('setAppState', appState => {
      this.setState({ appState })
      if (appState > APP_STATE.WALLET_LOCKED) this.props.showHeader(true)
      else this.props.showHeader(false)
    })
  }

  async onSuccessFromLogin() {
    popupMessanger.startSession()
    popupMessanger.setState(APP_STATE.WALLET_UNLOCKED)

    const account = await popupMessanger.getCurrentAccount()
    const website = await popupMessanger.getWebsite()
    const connection = await popupMessanger.getConnection(
      website ? website.origin : 'offline',
      account.id
    )

    const requests = await popupMessanger.getRequests()

    //no connections but request from injection with wallet locked
    if (!connection && requests.length > 0) {
      popupMessanger.updateConnection({
        website,
        requestToConnect: true,
        connected: false,
        enabled: false,
        accountId: account.id
      })
      this.props.showHeader(false)
      this.setState({
        appState: APP_STATE.WALLET_REQUEST_PERMISSION_OF_CONNECTION
      })
      popupMessanger.setState(APP_STATE.WALLET_REQUEST_PERMISSION_OF_CONNECTION)
      return
    }

    //unlocked and no injection requests
    else if ((!connection || connection.enabled) && requests.length === 0) {
      popupMessanger.startHandleAccountData()
      this.props.showHeader(true)
      this.setState({ appState: APP_STATE.WALLET_UNLOCKED })
      return
    }

    //.connect() with wallet locked
    else if (connection.requestToConnect === true) {
      this.props.showHeader(false)
      this.setState({
        appState: APP_STATE.WALLET_REQUEST_PERMISSION_OF_CONNECTION
      })
      popupMessanger.setState(APP_STATE.WALLET_REQUEST_PERMISSION_OF_CONNECTION)
      return
    } else if (connection.enabled === true) {
      popupMessanger.closePopup()
      popupMessanger.executeRequests()
    }
  }

  async onPermissionGranted() {
    const requestsWithUserInteraction = await popupMessanger.getRequestsWithUserInteraction()
    const website = await popupMessanger.getWebsite()
    popupMessanger.pushConnection({
      website,
      requestToConnect: false,
      connected: true,
      enabled: true
    })

    await popupMessanger.completeConnection(requestsWithUserInteraction)

    if (requestsWithUserInteraction.length > 0) {
      this.props.showHeader(false)
      this.setState({
        appState: APP_STATE.WALLET_REQUEST_IN_QUEUE_WITH_USER_INTERACTION
      })
      popupMessanger.setState(
        APP_STATE.WALLET_REQUEST_IN_QUEUE_WITH_USER_INTERACTION
      )
      return
    } else {
      popupMessanger.closePopup()
      popupMessanger.executeRequests()
    }
    this.props.showHeader(true)
    this.setState({ appState: APP_STATE.WALLET_UNLOCKED })
  }

  async onPermissionNotGranted() {
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

  /*onRejectAll() {
    this.props.showHeader(true)
    this.setState({ appState: APP_STATE.WALLET_UNLOCKED })
    popupMessanger.rejectAllTransfers()
  }*/

  //add network
  addCustomNetwork() {
    this.home.current.addCustomNetwork()
  }

  render() {
    switch (this.state.appState) {
      case APP_STATE.WALLET_NOT_INITIALIZED:
        return <Init onSuccess={this.onSuccessFromInit} />
      case APP_STATE.WALLET_LOCKED:
        return (
          <Login
            onSuccess={this.onSuccessFromLogin}
            onRestore={this.onRestore}
          />
        )
      case APP_STATE.WALLET_RESTORE:
        return (
          <Restore
            network={this.props.network}
            onSuccess={this.onSuccessFromRestore}
            onBack={this.onBack}
          />
        )
      case APP_STATE.WALLET_UNLOCKED:
        return (
          <Home
            ref={this.home}
            duplex={this.props.duplex}
            account={this.props.account}
            network={this.props.network}
            onLogout={this.onLogout}
            onShowHeader={show => this.props.showHeader(show)}
          />
        )
      case APP_STATE.WALLET_REQUEST_IN_QUEUE_WITH_USER_INTERACTION:
        return <ConfirmRequest duplex={this.props.duplex} />
      case APP_STATE.WALLET_REQUEST_PERMISSION_OF_CONNECTION:
        return (
          <Connector
            ref={this.connector}
            account={this.props.account}
            onPermissionGranted={this.onPermissionGranted}
            onPermissionNotGranted={this.onPermissionNotGranted}
          />
        )
      default:
        return ''
    }
  }
}

export default Main
