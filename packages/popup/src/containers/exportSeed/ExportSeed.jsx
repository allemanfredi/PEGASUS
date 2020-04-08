import React, { Component } from 'react'
import ExportSeedText from './exportSeedText/ExportSeedText'
import ExportSeedVault from './exportSeedVault/ExportSeedVault'
import OptionsSelector from '../../components/optionsSelector/OptionsSelector'
import { EXPORT_SEED_TEXT } from '../../texts'

class ExportSeed extends Component {
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
  }

  render() {
    return (
      <div className="container overflow-auto-475h">
        {!this.state.show.includes(true) ? (
          <OptionsSelector
            items={EXPORT_SEED_TEXT.items}
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
          <ExportSeedVault background={this.props.background} />
        ) : null}
        {this.state.show[1] ? (
          <ExportSeedText
            account={this.props.account}
            background={this.props.background}
            setNotification={this.props.setNotification}
          />
        ) : null}
      </div>
    )
  }
}

export default ExportSeed
