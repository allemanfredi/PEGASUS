
import React, { Component } from 'react';
import { getAllAccounts } from '../../wallet/wallet';

import './Settings.css';

class Settings extends Component {
    constructor(props, context) {
        super(props, context);

        this.switchAccount = this.switchAccount.bind(this);
        this.updateData = this.updateData.bind(this);

        this.state = {
            accounts: []
        };
    }

    async componentWillMount() {
        this.updateData();
    }

    async switchAccount(newAccount) {
        let accounts = await getAllAccounts(this.props.currentNetwork);
        accounts = accounts.filter( account => account.id !== newAccount.id );
        this.setState({ accounts });
        this.props.onSwitchAccount(newAccount);
    }

    async updateData() {
        let accounts = await getAllAccounts(this.props.currentNetwork);
        accounts = accounts.filter( account => !account.current );
        this.setState({ accounts });
    }

    render() {
        return (
            <div className='modal'>

                <div id='sidebar-wrapper'>

                    <div className='container-sidebar-header'>
                        <div className='container-close float-left'>
                            <button onClick={() => { this.props.onClose(); }} type='button' className='close' aria-label='Close'>
                                <span aria-hidden='true'>&times;</span>
                            </button>
                        </div>
                    </div>

                    <nav id='spy'>
                        <ul className='sidebar-nav nav'>

                            <li className='sidebar-header'>
                                <div className='row'>
                                    <div className='col-12 text-center'>
                                        <img src='./material/logo/iota-logo.png' height='50' width='50' alt='iota logo'/>
                                    </div>
                                </div>
                                <div className='row'>
                                    <div className='col-12 text-center'>
                                        <div onClick={() => { this.props.onShowEdit(); }}className='current-account'>
                                            {this.props.currentAccount.name}
                                        </div>
                                    </div>
                                </div>
                                <div className='row'>
                                    <div className='col-2'></div>
                                    <div className='col-8 text-center'>
                                        <div onClick={() => { this.props.onShowEdit(); }} className='address'>
                                            {this.props.currentAccount.data.latestAddress}
                                        </div>
                                    </div>
                                    <div className='col-2'></div>
                                </div>
                                <div className='row'>
                                    <div className='col-12 text-center'>
                                        <div className='current-balance'>
                                            {this.props.currentAccount.data.balance > 99999999 || this.props.currentAccount.data.balance < -99999999 ? `${(this.props.currentAccount.data.balance / 1000000000).toFixed(2) } Gi` :
                                                this.props.currentAccount.data.balance > 99999 || this.props.currentAccount.data.balance < -99999 ? `${(this.props.currentAccount.data.balance / 1000000).toFixed(2) } Mi` :
                                                    this.props.currentAccount.data.balance > 999 || this.props.currentAccount.data.balance < -999 ? `${(this.props.currentAccount.data.balance / 1000).toFixed(2) } Ki` :
                                                        `${this.props.currentAccount.data.balance }i` }
                                        </div>
                                    </div>
                                </div>
                            </li>

                            {this.state.accounts.map( account => {
                                return (<li className='sidebar-brand'>
                                    <div className='row'>
                                        <div className='col-2'><i className='fa fa-user'></i></div>
                                        <div className='col-8'>
                                            <a href='#' onClick={() => this.switchAccount(account)} data-scroll>
                                                <div className='span-text'>{account.name}</div>
                                            </a>
                                        </div>
                                    </div>
                                        </li>);
                            })}

                            <hr/>
                            <li className='sidebar-brand-logout'>
                                <div className='row'>
                                    <div className='col-2 text-center'><i className='fa fa-globe'></i></div>
                                    <div className='col-10 text-left'>
                                        <a href='#' onClick={() => { this.props.onShowMap(); }} data-scroll>
                                            <div className='span-text'>buy data</div>
                                        </a>
                                    </div>
                                </div>
                            </li>
                            <li className='sidebar-brand-add-account'>
                                <div className='row'>
                                    <div className='col-2 text-center'><i className='fa fa-plus'></i></div>
                                    <div className='col-10 text-left'>
                                        <a href='#' onClick={() => { this.props.onAddAccount(); }} data-scroll>
                                            <div className='span-text'>add account</div>
                                        </a>
                                    </div>
                                </div>
                            </li>
                            <li className='sidebar-brand-logout'>
                                <div className='row'>
                                    <div className='col-2 text-center'><i className='fa fa-sign-out'></i></div>
                                    <div className='col-10 text-left'>
                                        <a href='#' onClick={() => { this.props.onLogout(); }} data-scroll>
                                            <div className='span-text'>logout</div>
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
