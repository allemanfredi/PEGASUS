
import React, { Component } from 'react';
import history from '../../components/history';
import { getAllAccounts } from '../../wallet/wallet';
 

import './Settings.css';

class Settings extends Component {

    constructor(props,context) {
        super(props,context);
        
        this.close = this.close.bind(this);
        this.logOut = this.logOut.bind(this);
        this.addAccount = this.addAccount.bind(this);
        this.switchAccount = this.switchAccount.bind(this);

        this.state = {
            accounts : []
        }
    }

    close(){
        this.props.close();
    }
    logOut(){
        console.log("log out");
    }
    addAccount(){
        history.push('/add')
    }

    switchAccount(account){
        this.props.switchAccount(account);
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
                    <nav id="spy">
                        <ul class="sidebar-nav nav">
                            <li class="sidebar-brand">
                                <div class="section-close float-left">
                                    <button onClick={this.close} type="button" class="close" aria-label="Close">
                                        <span aria-hidden="true">&times;</span>
                                    </button>
                                 </div>
                            </li>
                            <li class="sidebar-brand">
                                <a class="text-center" >{this.props.currentAccount.name}</a>
                            </li>
                            
                            {this.state.accounts.map( account => {
                                return (<li>
                                            <a href="#" onClick={() => this.switchAccount(account)} data-scroll>
                                                <span class="fa fa-user">{account.name}</span>
                                            </a>
                                        </li>);
                            })}

                            <li class="sidebar-brand">
                                <li>
                                    <a href="#"  onClick={this.addAccount} data-scroll>
                                        <span class="fa fa-plus">add account</span>
                                    </a>
                                </li>
                            </li>
                        </ul>
                    </nav>
                </div>
            </div>
        );
    }
}

export default Settings;
    