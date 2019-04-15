import React, { Component } from 'react';
import {isSeedValid,checkPsw,resetData} from '../../wallet/wallet'
import {getAccountData} from '../../core/core';
import {aes256encrypt,sha256} from '../../utils/crypto'
import {addAccount,setCurrentNetwork} from '../../wallet/wallet';

import Loader from '../../components/loader/Loader'


class Restore extends Component {

    constructor(props,context) {
        super(props,context);

        this.onClickRestore = this.onClickRestore.bind(this);

        this.state = {
            seed : '',
            psw : '',
            isLoading : false
        }
    }

    async onClickRestore(){

        this.setState({isLoading:true});
        await resetData();
        const pswHash = sha256(this.state.psw);
        const eseed = aes256encrypt(this.state.seed,pswHash);
        const data = await getAccountData(this.state.seed); 
        const account = {
            name : "restored account",
            seed : eseed,
            data : data,
            network : this.props.network 
        }
        await addAccount(account);
        await setCurrentNetwork(this.props.network);
        this.setState({isLoading:false});
        this.props.onSuccess();
    }

    
    render() {
        return (
            <div>
                { this.state.isLoading ? <Loader></Loader> : (
                <div className="container-center">
                    <div className="row">
                        <div className="col-1"></div>
                        <div className="col-10 text-center">
                            <label for="inp-seed" className="inp ">
                                <input onChange={e => {this.setState({seed:e.target.value})}} type="text" id="inp-seed" placeholder="&nbsp;"/>
                                <span className="label">seed</span>
                                <span className="border"></span>
                            </label>
                        </div>
                        <div className="col-1"></div>
                    </div>
                    <div className="row">
                        <div className="col-1"></div>
                        <div className="col-10 text-center">
                            <button disabled={isSeedValid(this.state.seed)  ? false : true} onClick={this.onClickRestore} type="button" className="btn btn-blue mt-4">Restore</button>
                        </div>
                        <div className="col-1"></div>
                    </div>
                    <div className="row">
                        <div className="col-1"></div>
                        <div className="col-10 text-center">
                            <button onClick={e => {this.props.onBack()}} type="submit" className="btn btn-white">return to login</button>
                        </div>
                        <div className="col-1"></div>
                    </div>

                </div>
                )}
            </div>
        );
    }
}

export default Restore;
    