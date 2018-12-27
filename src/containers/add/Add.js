import React, { Component } from 'react';
import {getCurrentNewtwork,addAccount,getKey,generateSeed} from '../../wallet/wallet'
import {getAccountData} from '../../core/core';
import {aes256encrypt} from '../../utils/crypto';

import Loader from '../../components/loader/Loader'

import './Add.css';

class Add extends Component {

    constructor(props,context) {
        super(props,context);
        
        this.onClickAddAccount = this.onClickAddAccount.bind(this);
        this.handleChangeName = this.handleChangeName.bind(this);

        this.state = {
            name : '',
            isLoading : false
        }
    }

    handleChangeName(e){
        this.setState({name : e.target.value});
    }

    async onClickAddAccount(){
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
        this.props.onChangeAccount(account);
        
        //reset label
        this.setState({name : ''});
        this.setState({isLoading:false});
    }

    
    render() {
        return (
            <div>
                { this.state.isLoading ? <Loader></Loader> : (
                <div >
                    <form>
                        <input value={this.state.name} onChange={this.handleChangeName} type="text" class="form-control"  placeholder="Account name"/>
                        <button onClick={this.onClickAddAccount} type="button" class="btn btn-primary">Add Account</button>
                    </form>
                </div>
                )}
            </div>
        );
    }
}

export default Add;
    