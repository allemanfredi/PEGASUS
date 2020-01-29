import React, { Component } from 'react'
import Utils from '@pegasus/utils/utils'

class Header extends Component {
  constructor(props, context) {
    super(props, context)

    this.switchNetwork = this.switchNetwork.bind(this)
    this.addCustomNetwork = this.addCustomNetwork.bind(this)
    this.handleClickOutside = this.handleClickOutside.bind(this)

    this.state = {
      showNetworks: false
    }
  }

  componentDidMount() {
    document.addEventListener('mousedown', this.handleClickOutside)
  }

  componentWillUnmount() {
    document.removeEventListener('mousedown', this.handleClickOutside)
  }

  handleClickOutside(event) {
    if (this.wrapperRef && !this.wrapperRef.contains(event.target)) {
      this.setState({ showNetworks: false })
    }
  }

  switchNetwork(network) {
    this.setState({ showNetworks: false })
    this.props.changeNetwork(network)
  }

  addCustomNetwork() {
    this.setState({ showNetworks: false })
    this.props.addCustomNetwork()
  }

  render() {
    const isLogged =
      this.props.account && !Utils.isEmptyObject(this.props.account)

    return (
      <header>
        <div className="row pt-2 pb-2 pl-1 pr-1">
          <div className="col-3 my-auto">
            <img
              className="border-radius-50"
              src="./material/logo/pegasus-64.png"
              height="35"
              width="35"
              alt="pegasus logo"
            />
          </div>
          <div className="col-6 my-auto">
            <div className="row container-selection">
              <div className="col-10 text-center text-xs my-auto">
                {this.props.network.name}
              </div>
              <div className="col-2">
                <div
                  onClick={prevState =>
                    this.setState({ showNetworks: !prevState.showNetworks })
                  }
                  className="float-right"
                >
                  {this.state.showNetworks ? (
                    <span className="fa fa-chevron-up"></span>
                  ) : (
                    <span className="fa fa-chevron-down"></span>
                  )}
                </div>
              </div>
            </div>
          </div>
          {isLogged ? (
            <div className="col-3 my-auto text-right">
              <img
                className="border-radius-50 border-darkblue"
                src={`./material/profiles/${
                  this.props.account.avatar ? this.props.account.avatar : 1
                }.svg`}
                height="50"
                width="50"
                alt="avatar logo"
              />
            </div>
          ) : (
            ''
          )}
        </div>
        <div className="row">
          <div className="col-2"></div>
          <div className="col-9 ">
            {this.state.showNetworks ? (
              <div
                ref={ref => (this.wrapperRef = ref)}
                className="container-hidden-network"
              >
                <div className="container-hidden-network-header">Providers</div>
                <div className="container-hidden-network-body">
                  {this.props.networks.map((network, index) => {
                    return (
                      <div
                        onClick={() => this.switchNetwork(network)}
                        className="container-hidden-network-item"
                      >
                        <div className="container-icon-check">
                          {this.props.network.name === network.name ? (
                            <span className="fa fa-check"></span>
                          ) : (
                            ''
                          )}
                        </div>
                        {this.props.network.name === network.name ? (
                          <div className="container-hidden-network-item-name-selected">
                            {network.name}
                          </div>
                        ) : (
                          <div className="container-hidden-network-item-name-not-selected">
                            {network.name}
                          </div>
                        )}
                      </div>
                    )
                  })}
                  <hr className="bg-grey ml-1 mr-1 mt-1 mb-1" />
                  <div
                    onClick={() => this.addCustomNetwork()}
                    className="container-hidden-network-item"
                  >
                    <div className="container-hidden-network-item-name-not-selected">
                      Add custom provider
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              ''
            )}
          </div>
          <div className="col-1"></div>
        </div>
      </header>
    )
  }
}

export default Header
