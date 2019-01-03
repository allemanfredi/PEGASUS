import React, { Component } from 'react';
import {getCurrentNewtwork,addAccount,getKey,generateSeed} from '../../wallet/wallet'
import {getAccountData} from '../../core/core';
import {aes256encrypt} from '../../utils/crypto';

import Loader from '../../components/loader/Loader'

import './Restore.css';

class Restore extends Component {

    constructor(props,context) {
        super(props,context);

        this.onClickRestore = this.onClickRestore.bind(this);

        this.state = {
            seed : '',
            isLoading : false
        }
    }

    async onClickRestore(){

    }

    
    render() {
        return (
            <div>
                { this.state.isLoading ? <Loader></Loader> : (
                <div class="container-restore-account">
                    <div class="row">
                        <div class="col-1"></div>
                        <div class="col-10 text-center">
                            <label for="inp-seed" class="inp">
                                <input onChange={e => {this.setState({seed:e.target.value})}} type="text" id="inp-seed" placeholder="&nbsp;"/>
                                <span class="label">seed</span>
                                <span class="border"></span>
                            </label>
                        </div>
                        <div class="col-1"></div>
                    </div>
                    <div class="row">
                        <div class="col-1"></div>
                        <div class="col-10 text-center">
                            <button disabled={this.state.seed.length > 0 ? false : true} onClick={this.onClickRestore} type="button" class="btn btn-restore-account">RESTORE</button>
                        </div>
                        <div class="col-1"></div>
                    </div>
                    <div class="row">
                        <div class="col-1"></div>
                        <div class="col-10 text-center">
                            <button onClick={e => {this.props.onBack()}} type="submit" class="btn btn-login-back">return to login</button>
                        </div>
                        <div class="col-1"></div>
                    </div>

                </div>
                )}
            </div>
        );
    }
}

export default Restore;
    