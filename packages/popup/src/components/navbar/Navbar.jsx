import React, { Component } from 'react'

export default class Navbar extends Component {
  constructor(props) {
    super(props)

    this.deleteAccount = this.deleteAccount.bind(this)
    this.deleteNetwork = this.deleteNetwork.bind(this)
    this.exportSeed = this.exportSeed.bind(this)
    this.importSeed = this.importSeed.bind(this)
    this.handleClickOutside = this.handleClickOutside.bind(this)
    this.showSettings = this.showSettings.bind(this)
    this.addAccount = this.addAccount.bind(this)

    this.state = {
      showEllipseMenu: false
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
      this.setState({ showEllipseMenu: false })
    }
  }

  deleteAccount() {
    this.setState({ showEllipseMenu: false })
    this.props.onDeleteAccount()
  }

  deleteNetwork() {
    this.setState({ showEllipseMenu: false })
    this.props.onDeleteCurrentNetwork()
  }

  exportSeed() {
    this.setState({ showEllipseMenu: false })
    this.props.onExportSeed()
  }

  importSeed() {
    this.setState({ showEllipseMenu: false })
    this.props.onImportSeed()
  }

  showSettings () {
    this.setState({ showEllipseMenu: false })
    this.props.onShowSettings()
  }

  addAccount () {
    this.setState({ showEllipseMenu: false })
    this.props.onAddAccount()
  }

  render() {
    return (
      <div ref={ref => this.wrapperRef = ref} className='bg-darkblue'>
        <div className='row text-center '>
          {
            this.props.showBtnSettings 
              ? <div className='col-2'>
                  <button onClick={() => this.props.onClickMenu()} className='btn btn-icon'><i className='fa fa-bars'></i></button>
                </div>
              : ''
          }
          {
            this.props.showBtnBack 
              ? <div className='col-2'>
                  <button onClick={() => this.props.onBack()} className='btn btn-icon'><i className='fa fa-arrow-left'></i></button>
                </div>
              : ''
          }
          <div className='col-8 text-center my-auto'>
            <div className='text-white text-sm'>{this.props.text}</div>
          </div>
          {
            this.props.showBtnEllipse 
              ? <div className='col-2'>
                  <button onClick={() => this.setState({ showEllipseMenu: !this.state.showEllipseMenu })} 
                    className='btn btn-icon'>
                      <i className='fa fa-ellipsis-h'></i>
                  </button>
                </div>
              : ''
          }
        </div>
        {
          this.state.showEllipseMenu 
          ? <div className="container-ellipse-menu container">
              <div className="row mt-1 cursor-pointer" onClick={this.addAccount}>
                <div className="col-2 text-white text-center text-xs"><span className='fa fa-plus'></span></div>
                <div className="col-10 text-white text-xs">Add account</div>
              </div>
              <div className="row mt-1 cursor-pointer" onClick={this.deleteAccount}>
                <div className="col-2 text-white text-center text-xs"><span className='fa fa-trash-o'></span></div>
                <div className="col-10 text-white text-xs">Delete account</div>
              </div>
              <div className="row mt-1 cursor-pointer">
                <div className="col-2 text-white text-center text-xs"><span className='fa fa-wpexplorer'></span></div>
                <div className="col-10 ">
                  <a className="text-white text-xs cursor-pointer" 
                    href={this.props.network.link + 'address/' + this.props.account.data.latestAddress} 
                    target="_blank">View on explorer</a>
                </div>
              </div>
              <hr className="bg-white mt-1 mb-1" /> 
              <div className="row mt-1 cursor-pointer" onClick={this.exportSeed}>
                <div className="col-2 text-white text-center text-xs"><span className='fa fa-share'></span></div>
                <div className="col-10 text-white text-xs">Export seed</div>
              </div>
              <div className="row mt-1 cursor-pointer" onClick={this.importSeed}>
                <div className="col-2 text-white text-center text-xs"><span className='fa fa-plus'></span></div>
                <div className="col-10 text-white text-xs">Import seed</div>
              </div>
              {
                !this.props.network.default 
                  ? <hr className="bg-white mt-1 mb-1" /> 
                  : ''
              }
              {
                !this.props.network.default 
                  ? <div className="row mt-1 cursor-pointer" onClick={this.deleteNetwork}>
                      <div className="col-2 text-white text-center text-xs"><span className='fa fa-trash-o'></span></div>
                      <div className="col-10 text-white text-xs">Delete current network</div>
                    </div> 
                  : ''
              }
              {/*<hr className="bg-white mt-1 mb-1" /> 
              <div className="row mt-1 cursor-pointer" onClick={this.showSettings}>
                <div className="col-2 text-white text-center text-xs"><span className='fa fa-cogs'></span></div>
                <div className="col-10 text-white text-xs">Settings</div>
            </div>*/}
            </div>
            : ''
          }
      </div>
    )
  }
}