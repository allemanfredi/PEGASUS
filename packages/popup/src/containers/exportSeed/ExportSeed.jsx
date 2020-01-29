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
              <div className="col-12">
                <div className="row mt-3">
                  <div className="col-3">
                    <img
                      src="./material/img/vault.svg"
                      height="50"
                      width="50"
                      alt="vault logo"
                    />
                  </div>
                  <div className="col-9 text-blue text-left text-md font-weight-bold my-auto">
                    Export SeedVault
                  </div>
                </div>
                <div className="row mt-3 justify-content-center">
                  <div className="col-10 text-center text-xs text-gray">
                    Before to export the seed vault you will need to enter the
                    password to encrypt the exported seed
                  </div>
                </div>
              </div>
            </div>

            <hr className="mt-2 mb-2" />

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
              <div className="col-12">
                <div className="row mt-3">
                  <div className="col-3">
                    <img
                      src="./material/img/text.svg"
                      height="50"
                      width="50"
                      alt="text logo"
                    />
                  </div>
                  <div className="col-9 text-blue text-left text-md font-weight-bold my-auto">
                    Export as Text
                  </div>
                </div>
                <div className="row mt-3 justify-content-center">
                  <div className="col-10 text-center text-xs text-gray">
                    Before you can export the seed you will need to enter the
                    login password
                  </div>
                </div>
              </div>
            </div>

            <hr className="mt-2 mb-2" />
          </div>
        ) : null}
        {this.state.showExportSeedText ? <ExportSeedText /> : null}
        {this.state.showExportSeedVault ? <ExportSeedVault /> : null}
      </React.Fragment>
    )
  }
}

export default ExportSeed
