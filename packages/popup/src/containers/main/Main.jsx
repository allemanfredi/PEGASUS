import React, { Component } from 'react'
import Home from '../home/Home'
import Login from '../login/Login'
import Init from '../init/Init'
import Restore from '../restore/Restore'
import ConfirmRequest from '../confirm/ConfirmRequest'
import Connector from '../connector/Connector'
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
    await this.props.background.checkSession()
    let state = await this.props.background.getState()

    //closing popup in restore page
    if (state === APP_STATE.WALLET_RESTORE) {
      state = APP_STATE.WALLET_LOCKED
    }

    if (state >= APP_STATE.WALLET_LOCKED) {
      this.props.showHeader(true)
    }
    if (state >= APP_STATE.WALLET_UNLOCKED) {
      this.props.showHeader(true)
    }

    if (state === APP_STATE.WALLET_REQUEST_IN_QUEUE_WITH_USER_INTERACTION)
      this.props.showHeader(false)

    const connection = await this.props.background.getConnectionRequest()
    if (
      connection &&
      connection.requestToConnect &&
      state > APP_STATE.WALLET_LOCKED
    ) {
      this.props.background.setState(
        APP_STATE.WALLET_REQUEST_PERMISSION_OF_CONNECTION
      )
      state = APP_STATE.WALLET_REQUEST_PERMISSION_OF_CONNECTION
      this.props.showHeader(false)
    }

    const executableRequests = await this.props.background.getExecutableRequests()

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
        this.props.background.setState(
          APP_STATE.WALLET_REQUEST_IN_QUEUE_WITH_USER_INTERACTION
        )
        state = APP_STATE.WALLET_REQUEST_IN_QUEUE_WITH_USER_INTERACTION
      }
    }

    this.setState({ appState: state })
    this.bindDuplexRequests()
  }

  async onSuccessFromLogin() {
    this.props.background.setState(APP_STATE.WALLET_UNLOCKED)
    this.setState({ appState: APP_STATE.WALLET_UNLOCKED })

    const connection = await this.props.background.getConnectionRequest()
    if (connection && connection.requestToConnect) {
      this.props.background.setState(
        APP_STATE.WALLET_REQUEST_PERMISSION_OF_CONNECTION
      )
      this.setState({
        appState: APP_STATE.WALLET_REQUEST_PERMISSION_OF_CONNECTION
      })
      this.props.showHeader(false)
    }

    const executableRequests = await this.props.background.getExecutableRequests()
    const requestsWithNoUserInteraction = executableRequests.filter(
      request => !request.needUserInteraction
    )

    const requestsWithUserInteraction = executableRequests.filter(
      request => request.needUserInteraction
    )
    if (!connection && requestsWithNoUserInteraction.length > 0) {
      for (let request of requestsWithNoUserInteraction) {
        this.props.background.executeRequest(request)
      }
    }

    if (requestsWithUserInteraction.length > 0)
      this.props.background.setState(
        APP_STATE.WALLET_REQUEST_IN_QUEUE_WITH_USER_INTERACTION
      )

    if (!connection && requestsWithUserInteraction.length === 0)
      this.props.background.closePopup()
  }

  async onPermissionGranted() {
    await this.props.background.completeConnection()

    const executableRequests = await this.props.background.getExecutableRequests()

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
      this.props.background.setState(
        APP_STATE.WALLET_REQUEST_IN_QUEUE_WITH_USER_INTERACTION
      )
      return
    }

    if (requestsWithNoUserInteraction.length > 0) {
      for (let request of requestsWithNoUserInteraction) {
        this.props.background.executeRequest(request)
      }
      this.props.background.closePopup()
    }

    this.props.showHeader(true)
    this.setState({ appState: APP_STATE.WALLET_UNLOCKED })
  }

  onPermissionNotGranted() {
    this.props.background.rejectConnection()
    this.props.background.rejectRequests()
    this.props.showHeader(true)
  }

  bindDuplexRequests() {
    this.props.background.on('update', e => {
      const { state } = e

      if (
        state !== APP_STATE.WALLET_REQUEST_IN_QUEUE_WITH_USER_INTERACTION ||
        state !== APP_STATE.WALLET_REQUEST_PERMISSION_OF_CONNECTION ||
        state !== APP_STATE.WALLET_RESTORE
      )
        this.setState({ appState: state })

      if (
        state >= APP_STATE.WALLET_LOCKED ||
        state === APP_STATE.WALLET_RESTORE
      )
        this.props.showHeader(true)
      else this.props.showHeader(false)

      if (
        state === APP_STATE.WALLET_REQUEST_IN_QUEUE_WITH_USER_INTERACTION ||
        state === APP_STATE.WALLET_REQUEST_PERMISSION_OF_CONNECTION
      )
        this.props.showHeader(false)
    })
  }

  onSuccessFromInit() {
    this.props.showHeader(true)
    this.setState({ appState: APP_STATE.WALLET_UNLOCKED })
    this.props.background.setState(APP_STATE.WALLET_UNLOCKED)
  }

  onSuccessFromRestore() {
    this.props.showHeader(true)
    this.setState({ appState: APP_STATE.WALLET_UNLOCKED })
    this.props.background.setState(APP_STATE.WALLET_UNLOCKED)
  }

  onLogout() {
    this.props.showHeader(true)
    this.setState({ appState: APP_STATE.WALLET_LOCKED })
    this.props.background.setState(APP_STATE.WALLET_LOCKED)
  }

  onRestore() {
    this.props.showHeader(true)
    this.setState({ appState: APP_STATE.WALLET_RESTORE })
    this.props.background.setState(APP_STATE.WALLET_RESTORE)
  }

  onBack() {
    this.setState({ appState: APP_STATE.WALLET_LOCKED })
    this.props.background.setState(APP_STATE.WALLET_LOCKED)
  }

  /*onRejectAll() {
    this.props.showHeader(true)
    this.setState({ appState: APP_STATE.WALLET_UNLOCKED })
    this.props.background.rejectAllTransfers()
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
            background={this.props.background}
            onSuccess={this.onSuccessFromInit}
          />
        )
      case APP_STATE.WALLET_LOCKED:
        return (
          <Login
            background={this.props.background}
            onSuccess={this.onSuccessFromLogin}
            onRestore={this.onRestore}
          />
        )
      case APP_STATE.WALLET_RESTORE:
        return (
          <Restore
            network={this.props.network}
            background={this.props.background}
            setNotification={this.props.setNotification}
            onSuccess={this.onSuccessFromRestore}
            onBack={this.onBack}
          />
        )
      case APP_STATE.WALLET_UNLOCKED:
        return (
          <Home
            ref={this.home}
            account={this.props.account}
            network={this.props.network}
            background={this.props.background}
            setNotification={this.props.setNotification}
            onLogout={this.onLogout}
            onShowHeader={show => this.props.showHeader(show)}
          />
        )
      case APP_STATE.WALLET_REQUEST_IN_QUEUE_WITH_USER_INTERACTION:
        return <ConfirmRequest background={this.props.background} />
      case APP_STATE.WALLET_REQUEST_PERMISSION_OF_CONNECTION:
        return (
          <Connector
            ref={this.connector}
            account={this.props.account}
            background={this.props.background}
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
