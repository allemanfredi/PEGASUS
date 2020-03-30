import React from 'react'
import Switch from 'react-switch'
import ReactTooltip from 'react-tooltip'
import Input from '../../../components/input/Input'

class SecuritySettings extends React.Component {
  constructor(props, context) {
    super(props, context)

    this.handleChange = this.handleChange.bind(this)

    this.state = {
      settings: {
        autoLocking: {
          enabled: false,
          time: 0
        }
      }
    }
  }

  async componentWillMount() {
    const settings = await this.props.background.getPopupSettings()
    if (!settings) return

    this.setState({ settings })
  }

  handleChange(settings) {
    this.setState({ settings })
    this.props.background.setPopupSettings(settings)
  }

  render() {
    return (
      <React.Fragment>
        <div className="row mt-2">
          <ReactTooltip />
          <div
            className="col-9 text-xs my-auto text-dark-gray"
            data-tip="Number of minutes after which the wallet will unlock itself."
          >
            <i className="fa fa-info-circle mr-05" />
            Enable automatic locking
          </div>
          <div className="col-3 text-right">
            <Switch
              checked={this.state.settings.autoLocking.enabled}
              onChange={() => {
                this.handleChange({
                  ...this.state.settings,
                  autoLocking: {
                    enabled:
                      this.state.settings.autoLocking.time > 0
                        ? !this.state.settings.autoLocking.enabled
                        : false,
                    time: this.state.settings.autoLocking.time
                  }
                })
              }}
              onColor="#00008b"
              handleDiameter={30}
              uncheckedIcon={false}
              checkedIcon={false}
              boxShadow="0px 1px 5px rgba(0, 0, 0, 0.6)"
              activeBoxShadow="0px 0px 1px 10px rgba(0, 0, 0, 0.2)"
              height={20}
              width={48}
              className="react-switch"
            />
          </div>
        </div>
        <div className="row mt-05">
          <div className="col-12">
            <Input
              value={this.state.settings.autoLocking.time}
              onChange={e =>
                this.handleChange({
                  ...this.state.settings,
                  autoLocking: {
                    enabled:
                      e.target.value > 0
                        ? this.state.settings.autoLocking.enabled
                        : false,
                    time: e.target.value
                  }
                })
              }
              label="minutes"
              id="auto-prom-sec"
              type="number"
            />
          </div>
        </div>
        <hr className="mt-1 mb-1" />
      </React.Fragment>
    )
  }
}

export default SecuritySettings
