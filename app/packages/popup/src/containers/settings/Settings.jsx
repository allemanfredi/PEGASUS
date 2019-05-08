
import React, { Component } from 'react';
import { getAllAccounts } from '../../wallet/wallet';
import Utils from '@pegasus/lib/utils';
import { PopupAPI } from '@pegasus/lib/api';


class Settings extends Component {
    constructor(props, context) {
        super(props, context);

        this.switchAccount = this.switchAccount.bind(this);
        this.updateData = this.updateData.bind(this);
        this.handleClick = this.handleClick.bind(this);
        this.onChangeName = this.onChangeName.bind(this);

        this.state = {
            accounts: [],
            showEdit : false,
            editedName : this.props.currentAccount.name
        };
    }

    async componentWillMount() {
        this.updateData();
    }

    async switchAccount(newAccount) {
        let accounts = await PopupAPI.getAllAccounts(this.props.currentNetwork);
        accounts = accounts.filter( account => account.id !== newAccount.id );
        this.setState({ accounts });
        this.props.onSwitchAccount(newAccount);
    }

    async updateData() {
        let accounts = await PopupAPI.getAllAccounts(this.props.currentNetwork);
        accounts = accounts.filter( account => !account.current );
        this.setState({ accounts });
    }

    handleClick(e){
        if ( !this.edit.contains(e.target)){
            this.setState({showEdit:false});
        }
    }

    onChangeName(e){
        this.setState({editedName:e.target.value});
        this.props.onChangeName(e.target.value);
    }


    render() {
        return (
            <div className='modal'>
                <div onClick={this.handleClick} id='sidebar-wrapper'>
                    <nav id='spy'>
                        <ul className='sidebar-nav nav'>

                            <li className='sidebar-header'>

                                <div className="row">
                                    <div className="col-12 text-left">
                                        <button onClick={() => { this.props.onClose(); }} type='button' className='close' aria-label='Close'>
                                            <span aria-hidden='true'>&times;</span>
                                        </button>
                                    </div>
                                </div>

                                <div className='row mt-2'>
                                    <div className='col-12 text-center'>
                                        <img src='./material/logo/pegasus-64.png' height='40' width='40' alt='pegasus logo'/>
                                    </div>
                                </div>

                                <div className='row mt-3'>
                                    <div className="col-2"></div>
                                    <div ref={ edit => this.edit = edit} onClick={() => this.setState({showEdit:true})} className='col-8 text-center text-sm cursor-text'>
                                        {this.state.showEdit ? 
                                            <label htmlFor='inp-edit' className='inp'>
                                                <input  onChange={this.onChangeName} 
                                                        value={this.state.editedName} autoFocus type='text' id='inp-edit'/>
                                            </label> 
                                        : this.props.currentAccount.name }
                                        
                                    </div>
                                    <div className="col-2"></div>
                                </div>
                                <div className='row mt-1'>
                                    <div className="col-2"></div>
                                    <div className='col-8 text-center text-no-overflow text-xxs'>
                                        {this.props.currentAccount.data.latestAddress}
                                    </div>
                                    <div className="col-2"></div>
                                </div>
                                <div className='row mt-3'>
                                    <div className='col-6 text-right text-sm text text-bold pr-1'>
                                        { Utils.iotaReducer(this.props.currentAccount.data.balance) }
                                    </div>
                                    <div className="col-6 text-left pl-1">
                                        <img src='./material/logo/iota-logo.png' height='30' width='30' alt='iota logo'/>
                                    </div>
                                </div>
                            </li>

                            { this.state.accounts.map( account => {
                                return (<li className='sidebar-brand'>
                                    <div className='row'>
                                        <div className='col-2'><i className='fa fa-user'></i></div>
                                        <div className='col-8'>
                                            <a href='#' onClick={() => this.switchAccount(account)} data-scroll>
                                                <div className='text-xs text-black'>{account.name}</div>
                                            </a>
                                        </div>
                                    </div>
                                        </li>);
                            })}

                            <hr/>
                            <li className='sidebar-brand'>
                                <div className='row'>
                                    <div className='col-2 text-center'><i className='fa fa-globe'></i></div>
                                    <div className='col-10 text-left'>
                                        <a href='#' onClick={() => { this.props.onShowMap(); }} data-scroll>
                                            <div className='text-xs text-black'>buy data</div>
                                        </a>
                                    </div>
                                </div>
                            </li>
                            <li className='sidebar-brand'>
                                <div className='row'>
                                    <div className='col-2 text-center'><i className='fa fa-plus'></i></div>
                                    <div className='col-10 text-left'>
                                        <a href='#' onClick={() => { this.props.onAddAccount(); }} data-scroll>
                                            <div className='text-xs text-black'>add account</div>
                                        </a>
                                    </div>
                                </div>
                            </li>
                            <li className='sidebar-brand'>
                                <div className='row'>
                                    <div className='col-2 text-center'><i className='fa fa-sign-out'></i></div>
                                    <div className='col-10 text-left'>
                                        <a href='#' onClick={() => { this.props.onLogout(); }} data-scroll>
                                            <div className='text-xs text-black'>logout</div>
                                        </a>
                                    </div>
                                </div>
                            </li>

                        </ul>
                    </nav>
                </div>

            </div>
        );
    }
}

export default Settings;
