import React from 'react'
import Picklist from '../../../components/picklist/Picklist'
import ReactTooltip from 'react-tooltip'

class GeneralsSettings extends React.Component {
  constructor(props, context) {
    super(props, context)

    this.handleChange = this.handleChange.bind(this)

    this.state = {
      settings: {
        currencies: {
          selected: {
            value: 0
          },
          all: []
        }
      }
    }
  }

  async componentWillMount() {
    const settings = await this.props.background.getSettings()
    if (!settings) return

    this.setState({ settings })
  }

  handleChange(index) {
    this.setState(() => {
      const settings = this.state.settings
      settings.currencies.selected = this.state.settings.currencies.all.filter(
        curr => curr.value !== this.state.settings.currencies.selected.value
      )[index]

      this.props.background.setSettings(settings)

      return {
        settings
      }
    })
  }

  render() {
    return (
      <React.Fragment>
        <ReactTooltip />
        <div className="row mt-2">
          <div className="col-12 text-xs text-dark-gray">
            <i
              className="fa fa-info-circle mr-05"
              data-tip="This is the currency that will be used to manage the price shown"
            />
            Select the currency conversion
          </div>
          <div className="col-12 mt-1">
            <Picklist
              placeholder="Select a currency"
              text={this.state.settings.currencies.selected.value}
              options={this.state.settings.currencies.all
                .filter(
                  curr =>
                    curr.value !== this.state.settings.currencies.selected.value
                )
                .map(curr => curr.value)}
              onSelect={index => this.handleChange(index)}
            />
          </div>
        </div>
        <hr className="mt-1 mb-1" />
      </React.Fragment>
    )
  }
}

export default GeneralsSettings
