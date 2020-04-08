import React from 'react'
import AccountInfo from './accountInfo/AccountInfo'
import OptionsSelector from '../../components/optionsSelector/OptionsSelector'
import { RECEIVE_TEXT } from '../../texts'

class Receive extends React.Component {
  constructor(props, context) {
    super(props, context)

    this.goBack = this.goBack.bind(this)

    this.state = {
      show: [false, false]
    }
  }

  goBack() {
    this.setState({
      show: [false, false]
    })
    this.props.onChangeCanGoBack(true)
    this.props.changeNavbarText('Receive')
  }

  render() {
    return (
      <div className="container overflow-auto-475h">
        {!this.state.show.includes(true) ? (
          <OptionsSelector
            items={RECEIVE_TEXT.items}
            onClick={({ text, index }) => {
              this.props.changeNavbarText(text)
              this.props.onChangeCanGoBack(null)
              this.setState(() => {
                const show = [false, false]
                show[index] = true
                return {
                  show
                }
              })
            }}
          />
        ) : null}
        {this.state.show[0] ? (
          <AccountInfo
            account={this.props.account}
            setNotification={this.props.setNotification}
          />
        ) : null}
      </div>
    )
  }
}

export default Receive
