import React, { Component } from 'react'
import SimpleImport from './simpleImport/SimpleImport'
import KdxbImport from './kdbxImport/KdbxImport'
import OptionsSelector from '../../components/optionsSelector/OptionsSelector'
import { IMPORT_SEED_TEXT } from '../../texts'

class ImportSeed extends Component {
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

  goOn(index) {
    this.setState(() => {
      const show = [false, false]
      show[index] = true
      return {
        show
      }
    })
  }

  render() {
    return (
      <div className="container overflow-auto-475h">
        {!this.state.show.includes(true) ? (
          <OptionsSelector
            items={IMPORT_SEED_TEXT.items}
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
          <SimpleImport
            background={this.props.background}
            setNotification={this.props.setNotification}
            onTerminated={() => {
              this.props.onForcedBack()
            }}
          />
        ) : null}
        {this.state.show[1] ? (
          <KdxbImport
            account={this.props.account}
            background={this.props.background}
            setNotification={this.props.setNotification}
            onTerminated={() => {
              this.props.onForcedBack()
            }}
          />
        ) : null}
      </div>
    )
  }
}

export default ImportSeed
