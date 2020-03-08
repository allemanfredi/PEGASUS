import React from 'react'
import Switch from 'react-switch'
import { popupMessanger } from '@pegasus/utils/messangers'
import ReactTooltip from 'react-tooltip'
import Input from '../../../components/input/Input'

class TransactionsSettings extends React.Component {
  constructor(props, context) {
    super(props, context)

    this.handleChange = this.handleChange.bind(this)

    this.state = {
      settings: {
        autoPromotion: {
          enabled: false,
          time: 0
        }
      }
    }
  }

  async componentWillMount() {
    const settings = await popupMessanger.getPopupSettings()
    if (!settings) return

    this.setState({ settings })
  }

  handleChange(settings, action) {
    this.setState({ settings })
    popupMessanger.setPopupSettings(settings)

    if (action === 'promote') {
      if (settings.autoPromotion.enabled && settings.autoPromotion.time > 0) {
        popupMessanger.enableTransactionsAutoPromotion(
          this.state.settings.autoPromotion.time * 1000 * 60
        )
      } else if (!settings.autoPromotion.enabled) {
        popupMessanger.disableTransactionsAutoPromotion()
      }
    }
  }

  render() {
    return (
      <React.Fragment>
        <div className="row mt-2">
          <ReactTooltip />
          <div
            className="col-9 text-xs my-auto text-dark-gray"
            data-tip="Promote all transactions pending from the specified number of seconds"
          >
            <i className="fa fa-info-circle mr-05" />
            Enable transactions auto promotion
          </div>
          <div className="col-3 text-right">
            <Switch
              checked={this.state.settings.autoPromotion.enabled}
              onChange={() => {
                this.handleChange(
                  {
                    ...this.state.settings,
                    autoPromotion: {
                      enabled:
                        this.state.settings.autoPromotion.time > 3
                          ? !this.state.settings.autoPromotion.enabled
                          : false,
                      time: this.state.settings.autoPromotion.time
                    }
                  },
                  'promote'
                )
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
              value={this.state.settings.autoPromotion.time}
              onChange={e =>
                this.handleChange({
                  ...this.state.settings,
                  autoPromotion: {
                    enabled:
                      e.target.value > 3
                        ? this.state.settings.autoPromotion.enabled
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
        <div className="row mt-05">
          <div className="col-12 text-xxxs text-gray">
            (Must be greater than 3 minutes)
          </div>
        </div>
        <hr className="mt-1 mb-1" />
      </React.Fragment>
    )
  }
}

export default TransactionsSettings
