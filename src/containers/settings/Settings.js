
import React, { Component } from 'react';
import history from '../../components/history';
import { getAllAccounts } from '../../wallet/wallet';
 

import './Settings.css';

class Settings extends Component {

    constructor(props,context) {
        super(props,context);
        
        this.close = this.close.bind(this);
        this.logout = this.logout.bind(this);
        this.addAccount = this.addAccount.bind(this);
        this.switchAccount = this.switchAccount.bind(this);

        this.state = {
            accounts : []
        }

        console.log(this.props.currentAccount);
    }

    close(){
        this.props.onClose();
    }
    logout(){
        this.props.onLogout();
    }
    addAccount(){
        //history.push('/add');
        this.props.onAddAccount();
    }

    switchAccount(account){
        this.props.onSwitchAccount(account);
    }

    async componentWillMount(){
        let accounts = await getAllAccounts(this.props.currentNetwork);
        //remove the current account from all accounts
        accounts = accounts.filter( account => account.name !== this.props.currentAccount.name );
        this.setState({accounts : accounts});
    }
    
    render() {
        return (
            <div class="modal">

                 <div id="sidebar-wrapper">
                    
                    <div class="container-sidebar-header">
                         <div class="container-close float-left">
                            <button onClick={this.close} type="button" class="close" aria-label="Close">
                                <span aria-hidden="true">&times;</span>
                            </button>
                        </div>  
                    </div>
                    

                    <nav id="spy">
                        <ul class="sidebar-nav nav">  

                            <li class="sidebar-header">
                                <div class="current-account">
                                    {this.props.currentAccount.name}
                                </div>
                                <div class="current-balance">
                                    {this.props.currentAccount.data.balance} IOTA
                                </div>
                                
                            </li>

                            {this.state.accounts.map( account => {
                                return (<li class="sidebar-brand">
                                            <a href="#" onClick={() => this.switchAccount(account)} data-scroll>
                                                <span class="fa fa-user"></span>
                                                <div class="span-text">{account.name}</div>
                                            </a>
                                        </li>);
                            })}
                            
                            <hr/>
                            <li class="sidebar-brand-add-account">
                                <a href="#"  onClick={this.addAccount} data-scroll>
                                    <span class="fa fa-plus"></span>
                                    <div class="span-text">add account</div>
                                </a>
                            </li>
                            <li class="sidebar-brand-logout">   
                                <a href="#"  onClick={this.logout} data-scroll>
                                    <span class="fa fa-sign-out"></span>
                                    <div class="span-text">logout</div>
                                </a>  
                            </li>

                        </ul>
                    </nav>
                </div>

            </div>
        );
    }
}

export default Settings;
    