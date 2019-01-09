
import React, { Component } from 'react';
import history from '../../components/history';
import { getAllAccounts } from '../../wallet/wallet';
 

import './Settings.css';

class Settings extends Component {

    constructor(props,context) {
        super(props,context);
        
        this.switchAccount = this.switchAccount.bind(this);

        this.state = {
            accounts : []
        }
    }

    async componentWillMount(){
        let accounts = await getAllAccounts(this.props.currentNetwork);
        //remove the current account from all accounts
        accounts = accounts.filter( account => account.id !== this.props.currentAccount.id );
        this.setState({accounts : accounts});
    }

    async switchAccount(newAccount){
        let accounts = await getAllAccounts(this.props.currentNetwork);
        accounts = accounts.filter( account => account.id !== newAccount.id );
        this.setState({accounts : accounts});
        this.props.onSwitchAccount(newAccount);
    }
    
    render() {
        return (
            <div class="modal">

                 <div id="sidebar-wrapper">
                    
                    <div class="container-sidebar-header">
                         <div class="container-close float-left">
                            <button onClick={() => {this.props.onClose()}} type="button" class="close" aria-label="Close">
                                <span aria-hidden="true">&times;</span>
                            </button>
                        </div>  
                    </div>
                    

                    <nav id="spy">
                        <ul class="sidebar-nav nav">  

                            <li class="sidebar-header">
                                <div class="row">
                                    <div class="col-12 text-center">
                                        <img src="./material/logo/iota-logo.png" height="50" width="50"/>
                                    </div>
                                </div>   
                                <div class="row">
                                    <div class="col-12 text-center">
                                        <div onClick={() => {this.props.onShowEdit()}}class="current-account">
                                            {this.props.currentAccount.name} 
                                        </div>
                                    </div>
                                </div>    
                                <div class="row">
                                    <div class="col-2"></div>
                                    <div class="col-8 text-center">
                                        <div onClick={() => {this.props.onShowEdit()}} class="address">
                                            {this.props.currentAccount.data.latestAddress} 
                                        </div>
                                    </div>
                                    <div class="col-2"></div>
                                </div>    
                                <div class="row">
                                    <div class="col-12 text-center">
                                        <div class="current-balance">
                                            {this.props.currentAccount.data.balance > 99999999 || this.props.currentAccount.data.balance < -99999999 ? (this.props.currentAccount.data.balance / 1000000000).toFixed(2) + " Gi" : 
                                            this.props.currentAccount.data.balance > 99999 || this.props.currentAccount.data.balance < -99999  ? (this.props.currentAccount.data.balance / 1000000).toFixed(2) + " Mi" :
                                            this.props.currentAccount.data.balance > 999 || this.props.currentAccount.data.balance < -999 ?  (this.props.currentAccount.data.balance / 1000).toFixed(2) + " Ki"  :  
                                            this.props.currentAccount.data.balance + "i" }
                                        </div>
                                    </div>
                                </div>                              
                            </li>

                            {this.state.accounts.map( account => {
                                return (<li class="sidebar-brand">
                                            <div class="row">
                                                <div class="col-2"><i class="fa fa-user"></i></div>
                                                <div class="col-8">
                                                    <a href="#" onClick={() => this.switchAccount(account)} data-scroll>
                                                        <div class="span-text">{account.name}</div>
                                                    </a>
                                                </div>
                                            </div>
                                        </li>);
                            })}
                            
                            <hr/>
                            <li class="sidebar-brand-logout">   
                                <div class="row">
                                    <div class="col-2 text-center"><i class="fa fa-globe"></i></div>
                                    <div class="col-10 text-left">
                                        <a href="#" onClick={() => {this.props.onShowMap()}} data-scroll>
                                            <div class="span-text">buy data</div>
                                        </a>  
                                    </div>
                                </div>
                            </li>
                            <li class="sidebar-brand-add-account">
                                <div class="row">
                                    <div class="col-2 text-center"><i class="fa fa-plus"></i></div>
                                    <div class="col-10 text-left">
                                        <a href="#"  onClick={() => {this.props.onAddAccount()}} data-scroll>
                                            <div class="span-text">add account</div>
                                        </a>
                                    </div>
                                </div>
                            </li>
                            <li class="sidebar-brand-logout">   
                                <div class="row">
                                    <div class="col-2 text-center"><i class="fa fa-sign-out"></i></div>
                                    <div class="col-10 text-left">
                                        <a href="#"  onClick={() => {this.props.onLogout()}} data-scroll>
                                            <div class="span-text">logout</div>
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
    