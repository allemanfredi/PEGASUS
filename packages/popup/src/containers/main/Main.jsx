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

    //closing popup in restore page
    if (state === APP_STATE.WALLET_RESTORE) {
      state = APP_STATE.WALLET_LOCKED
    }

    if (state >= APP_STATE.WALLET_LOCKED) {
      this.props.showHeader(true)
    }
    if (state >= APP_STATE.WALLET_UNLOCKED) {
      popupMessanger.startHandleAccountData()
      this.props.showHeader(true)
    }

    if (state === APP_STATE.WALLET_REQUEST_IN_QUEUE_WITH_USER_INTERACTION)
      this.props.showHeader(false)

    const connection = await popupMessanger.getConnectionRequest()
    if (
      connection &&
      connection.requestToConnect &&
      state > APP_STATE.WALLET_LOCKED
    ) {
      popupMessanger.setState(APP_STATE.WALLET_REQUEST_PERMISSION_OF_CONNECTION)
      state = APP_STATE.WALLET_REQUEST_PERMISSION_OF_CONNECTION
      this.props.showHeader(false)
    }

    const executableRequests = await popupMessanger.getExecutableRequests()

    if (
      !connection &&
      executableRequests.length > 0 &&
      state >= APP_STATE.WALLET_UNLOCKED
    ) {
      const needUserInteraction = executableRequests.find(
        request => request.needUserInteraction
      )
      if (needUserInteraction) {
        this.props.showHeader(false)
        popupMessanger.setState(
          APP_STATE.WALLET_REQUEST_IN_QUEUE_WITH_USER_INTERACTION
        )
        state = APP_STATE.WALLET_REQUEST_IN_QUEUE_WITH_USER_INTERACTION
      }
    }

    this.setState({ appState: state })
    this.bindDuplexRequests()
  }

  async onSuccessFromLogin() {
    popupMessanger.startSession()
    popupMessanger.setState(APP_STATE.WALLET_UNLOCKED)
    this.setState({ appState: APP_STATE.WALLET_UNLOCKED })

    const connection = await popupMessanger.getConnectionRequest()
    if (connection && connection.requestToConnect) {
      popupMessanger.setState(APP_STATE.WALLET_REQUEST_PERMISSION_OF_CONNECTION)
      this.setState({
        appState: APP_STATE.WALLET_REQUEST_PERMISSION_OF_CONNECTION
      })
      this.props.showHeader(false)
    }

    const executableRequests = await popupMessanger.getExecutableRequests()
    const requestsWithNoUserInteraction = executableRequests.filter(
      request => !request.needUserInteraction
    )

    const requestsWithUserInteraction = executableRequests.filter(
      request => request.needUserInteraction
    )
    if (!connection && requestsWithNoUserInteraction.length > 0) {
      for (let request of requestsWithNoUserInteraction) {
        popupMessanger.executeRequest(request)
      }
    }

    if (requestsWithUserInteraction.length > 0)
      popupMessanger.setState(
        APP_STATE.WALLET_REQUEST_IN_QUEUE_WITH_USER_INTERACTION
      )

    if (!connection && requestsWithUserInteraction.length === 0)
      popupMessanger.closePopup()
  }

  async onPermissionGranted() {
    await popupMessanger.completeConnection()

    const executableRequests = await popupMessanger.getExecutableRequests()

    const requestsWithUserInteraction = executableRequests.filter(
      request => request.needUserInteraction
    )

    const requestsWithNoUserInteraction = executableRequests.filter(
      request => !request.needUserInteraction
    )

    if (requestsWithUserInteraction.length > 0) {
      this.props.showHeader(false)
      this.setState({
        appState: APP_STATE.WALLET_REQUEST_IN_QUEUE_WITH_USER_INTERACTION
      })
      popupMessanger.setState(
        APP_STATE.WALLET_REQUEST_IN_QUEUE_WITH_USER_INTERACTION
      )
      return
    }

    if (requestsWithNoUserInteraction.length > 0) {
      for (let request of requestsWithNoUserInteraction) {
        popupMessanger.executeRequest(request)
      }
      popupMessanger.closePopup()
    }

    this.props.showHeader(true)
    this.setState({ appState: APP_STATE.WALLET_UNLOCKED })
  }

  onPermissionNotGranted() {
    popupMessanger.rejectConnection()
    popupMessanger.rejectRequests()
    this.props.showHeader(true)
  }

  bindDuplexRequests() {
    this.props.duplex.on('setAppState', appState => {
      if (
        appState !== APP_STATE.WALLET_REQUEST_IN_QUEUE_WITH_USER_INTERACTION ||
        appState !== APP_STATE.WALLET_REQUEST_PERMISSION_OF_CONNECTION ||
        appState !== APP_STATE.WALLET_RESTORE
      )
        this.setState({ appState })

      if (
        appState >= APP_STATE.WALLET_LOCKED ||
        appState === APP_STATE.WALLET_RESTORE
      )
        this.props.showHeader(true)
      else this.props.showHeader(false)

      if (
        appState === APP_STATE.WALLET_REQUEST_IN_QUEUE_WITH_USER_INTERACTION ||
        appState === APP_STATE.WALLET_REQUEST_PERMISSION_OF_CONNECTION
      )
        this.props.showHeader(false)
    })
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
        return (
          <Init
            setNotification={this.props.setNotification}
            onSuccess={this.onSuccessFromInit}
          />
        )
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
            setNotification={this.props.setNotification}
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
            setNotification={this.props.setNotification}
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
