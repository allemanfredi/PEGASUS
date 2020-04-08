import React, { Component } from 'react'
import MamExplorer from './mamExplorer/MamExplorer'
import OptionsSelector from '../../components/optionsSelector/OptionsSelector'
import { MAM_TEXT } from '../../texts'

class Mam extends Component {
  constructor(props, context) {
    super(props, context)

    this.goBack = this.goBack.bind(this)

    this.state = {
      show: [false, false, false],
      error: null
    }
  }

  goBack() {
    this.setState({
      show: [false, false, false]
    })
    this.props.onChangeCanGoBack(true)
    this.props.changeNavbarText('MAM')
  }

  render() {
    return (
      <div className="container overflow-auto-475h">
        {!this.state.show.includes(true) ? (
          <OptionsSelector
            items={MAM_TEXT.items}
            onClick={({ text, index }) => {
              this.props.changeNavbarText(text)
              this.props.onChangeCanGoBack(null)
              this.setState(() => {
                const show = [false, false, false]
                show[index] = true
                return {
                  show
                }
              })
            }}
          />
        ) : null}
        {this.state.show[0] ? (
          <MamExplorer
            background={this.props.background}
            onBack={() => this.props.onBack()}
          />
        ) : null}
      </div>
    )
  }
}

export default Mam
