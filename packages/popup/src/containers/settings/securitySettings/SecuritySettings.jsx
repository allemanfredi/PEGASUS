import React from 'react'
import Switch from 'react-switch'
import ReactTooltip from 'react-tooltip'
import OutlinedInput from '../../../components/outlinedInput/OutlinedInput'

class SecuritySettings extends React.Component {
  constructor(props, context) {
    super(props, context)

    this.handleChange = this.handleChange.bind(this)

    this.state = {
      settings: {
        autoLocking: {
          enabled: false
        }
      },
      time: 0
    }
  }

  async componentWillMount() {
    const settings = await this.props.background.getSettings()
    if (!settings) return

    this.setState({
      settings,
      time: settings.autoLocking.time
    })
  }

  handleChange(settings) {
    if (!settings.autoLocking.enabled) {
      settings.autoLocking.time = 0
      this.setState({ time: 0, settings })
    } else if (settings.autoLocking.enabled && this.state.time >= 5) {
      settings.autoLocking.time = this.state.time
      this.setState({ settings })
    }

    this.props.background.setSettings(settings)
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
                    enabled: !this.state.settings.autoLocking.enabled,
                    time: this.state.time
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
            <OutlinedInput
              value={this.state.time}
              onChange={e => {
                this.setState({ time: parseInt(e.target.value) })
                if (e.target.value < 5) {
                  this.setState({
                    ...this.state.settings,
                    autoLocking: {
                      enabled: false,
                      time: 0
                    }
                  })
                  this.props.background.setSettings({
                    ...this.state.settings,
                    autoLocking: {
                      enabled: false,
                      time: 0
                    }
                  })
                }
                if (
                  this.state.settings.autoLocking.enabled &&
                  e.target.value >= 5
                ) {
                  this.props.background.setSettings({
                    ...this.state.settings,
                    autoLocking: {
                      enabled: true,
                      time: parseInt(e.target.value)
                    }
                  })
                }
              }}
              label="minutes"
              id="auto-prom-sec"
              type="number"
            />
          </div>
        </div>
        <div className="row mt-05">
          <div className="col-12 text-xxxs text-gray">
            (Must be greater than 4 minutes)
          </div>
        </div>
        <hr className="mt-1 mb-1" />
      </React.Fragment>
    )
  }
}

export default SecuritySettings
