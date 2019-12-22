
import React, { Component } from 'react'
import Utils from '@pegasus/utils/utils'
import { popupMessanger } from '@pegasus/utils/messangers'
import ReactTooltip from 'react-tooltip'
import ChangeAvatar from '../changeAvatar/ChangeAvatar'

class Settings extends Component {
  constructor(props, context) {
    super(props, context)

    this.switchAccount = this.switchAccount.bind(this)
    this.updateData = this.updateData.bind(this)
    this.onClose = this.onClose.bind(this)
    this.handleClick = this.handleClick.bind(this)
    this.onChangeName = this.onChangeName.bind(this)

    this.state = {
      accounts: [],
      showEdit: false,
      editedName: this.props.account.name,
      isDisappearing: false,
      showFullAddress: false,
      showChangeAvatar: false
    }
  }

  async componentWillMount() {
    this.updateData()
  }

  async switchAccount(newAccount) {
    let accounts = await popupMessanger.getAllAccounts()
    accounts = accounts.filter(account => account.id !== newAccount.id)
    this.setState({ accounts })
    this.props.onSwitchAccount(newAccount)
  }

  async updateData() {
    let accounts = await popupMessanger.getAllAccounts()
    accounts = accounts.filter(account => !account.current)
    this.setState({ accounts })
  }

  async onClose() {
    this.setState({
      isDisappearing: true
    })
    await Utils.sleep(190)
    this.props.onClose()
  }

  handleClick(e) {
    if (!this.edit.contains(e.target)) {
      this.setState({ showEdit: false })
    }
  }

  onChangeName(e) {
    this.setState({ editedName: e.target.value })
    //this.props.onChangeName(e.target.value)
    popupMessanger.updateNameAccount(this.props.account, e.target.value)
  }

  render() {
    return (
      <div className='modal mt-6'>
        {
          this.state.showChangeAvatar
            ? <ChangeAvatar account={this.props.account}
              onClose={() => this.setState({showChangeAvatar: false})}/>
            : null
        }
        <div onClick={this.handleClick} 
          id='sidebar-wrapper'
          className={this.state.isDisappearing ? 'sidebar-wrapper-disappear' : ''}>
          <nav id='spy'>
          <ReactTooltip/>
            <ul className='sidebar-nav nav'>
              <li className='sidebar-header'>
                <div className="row">
                  <div className="col-12 text-left">
                    <button onClick={this.onClose} type="button" className="close mt-05 mr-05">
                      <span className="fa fa-times"></span>
                    </button>
                  </div>
                </div>
                <div className='row mt-2'>
                  <div className='col-12 text-center'>
                    <img className="border-radius-50 cursor-pointer"
                      src={`./material/profiles/${this.props.account.avatar ? this.props.account.avatar : 1}.svg`} 
                      height='80'
                      width='80'
                      alt='pegasus logo'
                      data-tip="change avatar"
                      onClick={() => this.setState({ showChangeAvatar: !this.state.showChangeAvatar})}/>
                  </div>
                </div>
                <div className='row mt-2 justify-content-center'>
                  <div ref={edit => this.edit = edit} onClick={() => this.setState({ showEdit: true })}
                  className='col-8 text-center text-sm cursor-text font-weight-bold'
                  data-tip="change name">
                    {
                      this.state.showEdit ?
                        <label htmlFor='inp-edit' className='inp'>
                          <input onChange={this.onChangeName}
                            value={this.state.editedName} autoFocus type='text' id='inp-edit' />
                        </label>
                      : this.props.account.name
                    }
                  </div>
                </div>
                <div className='row mt-1 justify-content-center'>
                  <div className={'col-10 text-center text-xxs line-height-1-5' + (!this.state.showFullAddress ? ' text-no-overflow' : ' break-text')}>
                    {
                      !this.state.showFullAddress
                        ? Utils.showAddress(
                            Utils.checksummed(this.props.account.data.latestAddress),
                            6,
                            8
                          )
                        : Utils.checksummed(this.props.account.data.latestAddress)
                    }
                  </div>
                </div>
                <div className='row mt-05'>
                  <div onClick={() => this.setState({showFullAddress: !this.state.showFullAddress})} 
                    className='col-12 text-center text-blue text-xxs cursor-pointer'>
                    {
                      !this.state.showFullAddress ? 'Show Full Address' : 'Hide Full Address'
                    }
                  </div>
                </div>
                <div className='row mt-2'>
                  <div className='col-6 text-right text-sm text text-bold pr-1'>
                    {
                      Utils.iotaReducer(
                        this.props.account.data.balance[this.props.network.type]
                          ? this.props.account.data.balance[this.props.network.type]
                          : 0
                      )
                    }
                  </div>
                  <div className="col-6 text-left pl-1">
                    <img src='./material/logo/iota-logo.png' height='30' width='30' alt='iota logo' />
                  </div>
                </div>
              </li>
              {
                this.state.accounts.map(account => {
                  return (
                    <li className='sidebar-brand cursor-pointer'>
                      <div className='row'>
                        <div className='col-2'>
                          <img src={`./material/profiles/${account.avatar ? account.avatar : 1}.svg`} height="25" width="25"/>
                        </div>
                        <div className='col-8'>
                          <span onClick={() => this.switchAccount(account)}>
                            <div className='text-gray text-xs text-xxs'>{account.name}</div>
                          </span>
                        </div>
                      </div>
                    </li>
                  )
                })
              }
              <hr className="mt-1 mb-1"/>
              <li className='sidebar-brand mt-1 mb-1 cursor-pointer'>
                <div className='row'>
                  <div className='col-2 text-center'><i className='fa fa-steam'></i></div>
                  <div className='col-10 text-left'>
                    <span onClick={() => { this.props.onMam() }}>
                      <div className='text-black'>MAM</div>
                    </span>
                  </div>
                </div>
              </li>
              <hr className="mt-1 mb-1"/>
              <li className='sidebar-brand cursor-pointer'>
                <div className='row'>
                  <div className='col-2 text-center'><i className='fa fa-sign-out'></i></div>
                  <div className='col-10 text-left'>
                    <span onClick={() => { this.props.onLogout() }}>
                      <div className='text-black'>logout</div>
                    </span>
                  </div>
                </div>
              </li>
            </ul>
          </nav>
        </div>
      </div>
    )
  }
}

export default Settings