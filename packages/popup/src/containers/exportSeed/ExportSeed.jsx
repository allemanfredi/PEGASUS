import React, { Component } from 'react'
import ExportSeedText from './exportSeedText/ExportSeedText'
import ExportSeedVault from './exportSeedVault/ExportSeedVault'

class ExportSeed extends Component {
  constructor(props, context) {
    super(props, context)

    this.goBack = this.goBack.bind(this)

    this.state = {
      showExportSeedVault: false,
      showExportSeedText: false
    }
  }

  goBack() {
    this.setState({
      showExportSeedVault: false,
      showExportSeedText: false
    })
    this.props.onChangeCanGoBack(true)
  }

  render() {
    return (
      <React.Fragment>
        {!this.state.showExportSeedVault && !this.state.showExportSeedText ? (
          <div className="container">
            <div
              className="row cursor-pointer"
              onClick={() => {
                if (!this.state.showExportSeedVault)
                  this.props.onChangeCanGoBack(null)
                this.setState({
                  showExportSeedVault: !this.state.showExportSeedVault
                })
              }}
            >
              <div className="col-9 mt-2">
                <div className="row">
                  <div className="col-12 text-dark-gray font-weight-bold text-md">
                    Export SeedVault
                  </div>
                </div>
                <div className="row">
                  <div className="col-12 text-gray text-xs mb-1">
                    Before to export the seed vault you will need to enter the
                    password to encrypt the exported seed
                  </div>
                </div>
              </div>
              <div className="col-3 my-auto text-right">
                <img src="./material/img/right.png" height="50" />
              </div>
            </div>

            <hr className="mt-1" />

            <div
              className="row cursor-pointer"
              onClick={() => {
                if (!this.state.showExportSeedText)
                  this.props.onChangeCanGoBack(null)
                this.setState({
                  showExportSeedText: !this.state.showExportSeedText
                })
              }}
            >
              <div className="col-9 mt-2">
                <div className="row">
                  <div className="col-12 text-dark-gray font-weight-bold text-md">
                    Export as Text
                  </div>
                </div>
                <div className="row">
                  <div className="col-12 text-gray text-xs mb-1">
                    Before you can export the seed you will need to enter the
                    login password
                  </div>
                </div>
              </div>
              <div className="col-3 my-auto text-right">
                <img src="./material/img/right.png" height="50" />
              </div>
            </div>

            <hr className="mt-2 mb-2" />
          </div>
        ) : null}
        {this.state.showExportSeedText ? (
          <ExportSeedText
            account={this.props.account}
            background={this.props.background}
            setNotification={this.props.setNotification}
          />
        ) : null}
        {this.state.showExportSeedVault ? (
          <ExportSeedVault background={this.props.background} />
        ) : null}
      </React.Fragment>
    )
  }
}

export default ExportSeed
