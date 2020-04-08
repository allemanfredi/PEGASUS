import React from 'react'
import TransactionsSettings from './transactionsSettings/TransactionsSettings'
import ConnectionsSettings from './connectionsSettings/ConnectionsSettings'
import SecuritySettings from './securitySettings/SecuritySettings'
import GeneralsSettings from './generalsSettings/GeneralsSettings'
import OptionsSelector from '../../components/optionsSelector/OptionsSelector'
import { SETTINGS_TEXT } from '../../texts'

class Settings extends React.Component {
  constructor(props, context) {
    super(props, context)

    this.goBack = this.goBack.bind(this)

    this.state = {
      show: [false, false, false, false]
    }
  }

  goBack() {
    this.setState({
      show: [false, false]
    })
    this.props.onChangeCanGoBack(true)
    this.props.changeNavbarText('Settings')
  }

  render() {
    return (
      <div className="container overflow-auto-475h">
        {!this.state.show.includes(true) ? (
          <OptionsSelector
            items={SETTINGS_TEXT.items}
            onClick={({ text, index }) => {
              this.props.changeNavbarText(text)
              this.props.onChangeCanGoBack(null)
              this.setState(() => {
                const show = [false, false, false, false]
                show[index] = true
                return {
                  show
                }
              })
            }}
          />
        ) : null}
        {this.state.show[0] ? (
          <ConnectionsSettings
            background={this.props.background}
            setNotification={this.props.setNotification}
          />
        ) : null}
        {this.state.show[1] ? (
          <TransactionsSettings
            background={this.props.background}
            setNotification={this.props.setNotification}
          />
        ) : null}
        {this.state.show[2] ? (
          <SecuritySettings
            background={this.props.background}
            setNotification={this.props.setNotification}
          />
        ) : null}
        {this.state.show[3] ? (
          <GeneralsSettings
            background={this.props.background}
            setNotification={this.props.setNotification}
          />
        ) : null}
      </div>
    )
  }
}

export default Settings
