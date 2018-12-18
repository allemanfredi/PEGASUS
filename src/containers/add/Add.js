import React, { Component } from 'react';
import history from '../../components/history';
import {getCurrentNewtwork,addAccount,getKey,generateSeed} from '../../wallet/wallet'
import {getAccountData} from '../../core/core';
import {aes256encrypt} from '../../utils/crypto';

import './Add.css';

class Add extends Component {

    constructor(props,context) {
        super(props,context);
        
        this.close = this.close.bind(this);
        this.addAccount = this.addAccount.bind(this);
        this.handleChangeName = this.handleChangeName.bind(this);

        this.state = {
            name : '',
            isLoading : false
        }
    }

    handleChangeName(e){
        this.setState({name : e.target.value});
    }

    close(){
        history.push('/home');
    }

    async addAccount(){
        this.setState({isLoading:true});

        const currentNetwork = await getCurrentNewtwork();
        const seed = generateSeed();
        const key = await getKey()
        const eseed = aes256encrypt(seed,key);

        //get all account data
        const data = await getAccountData(seed);
        const account = {
            name : this.state.name,
            seed : eseed,
            data : data,
            network : currentNetwork
        }
        await addAccount(account,true); //new current account
        history.push('/home');
    }

    
    render() {
        return (
            <div>
                { this.state.isLoading ? ('Creating account...') : (
                <div >
                    <div class="section-close float-left">
                        <button onClick={this.close} type="button" class="close" aria-label="Close">
                            <span aria-hidden="true">&times;</span>
                        </button>
                    </div>
                    <form>
                        <input value={this.state.name} onChange={this.handleChangeName} type="text" class="form-control"  placeholder="Account name"/>
                        <button onClick={this.addAccount} type="button" class="btn btn-primary">Add Account</button>
                    </form>
                </div>
                )}
            </div>
        );
    }
}

export default Add;
    