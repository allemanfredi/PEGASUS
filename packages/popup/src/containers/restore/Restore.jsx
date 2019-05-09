import React, { Component } from 'react';

import IOTA from '@pegasus/lib/iota';
import { PopupAPI } from '@pegasus/lib/api';
import Utils from '@pegasus/lib/utils';


import Loader from '../../components/loader/Loader';

class Restore extends Component {
    constructor(props, context) {
        super(props, context);

        this.onClickRestore = this.onClickRestore.bind(this);
        this.onChangeSeed = this.onChangeSeed.bind(this);

        this.state = {
            seed: '',
            psw: '',
            isLoading: false,
            seedIsValid : true
        };
    }

    async onClickRestore() {
        this.setState({ isLoading: true });
        await PopupAPI.resetData();
        const pswHash = Utils.sha256(this.state.psw);
        const eseed = Utils.aes256encrypt(this.state.seed, pswHash);
        const data = await IOTA.getAccountData(this.state.seed);
        const account = {
            name: 'restored account',
            seed: eseed,
            data,
            network: this.props.network
        };
        await PopupAPI.addAccount(account);
        await PopupAPI.setCurrentNetwork(this.props.network);
        this.setState({ isLoading: false });
        this.props.onSuccess();
    }

    onChangeSeed(e){
        this.setState({seed : e.target.value});
        const isValid = PopupAPI.isSeedValid(this.state.seed);
        if ( isValid ){
            this.setState({seedIsValid:true});
        }else this.setState({seedIsValid:false});
    }

    render() {
        return (
                this.state.isLoading ? <Loader></Loader> : (
                <div className='container container-center'>
                    <div className='row'>
                        <div className='col-1'></div>
                        <div className='col-10 text-center'>
                            <label htmlFor='inp-seed' className='inp '>
                                <input onChange={this.onChangeSeed} type='text' id='inp-seed' placeholder='&nbsp;'/>
                                <span className='label'>seed</span>
                                <span className='border'></span>
                            </label>
                        </div>
                        <div className='col-1'></div>
                    </div>
                    <div className='row mt-4'>
                        <div className='col-1'></div>
                        <div className='col-10 text-center'>
                            <button disabled={ this.state.seedIsValid ? false : true} onClick={this.onClickRestore} type='button' className='btn btn-blue text-bold btn-big'>Restore</button>
                        </div>
                        <div className='col-1'></div>
                    </div>
                    <div className='row'>
                        <div className='col-1'></div>
                        <div className='col-10 text-center'>
                            <button onClick={e => { this.props.onBack(); }} type='submit' className='btn btn-white'>return to login</button>
                        </div>
                        <div className='col-1'></div>
                    </div>

                </div>
            )
        );
    }
}

export default Restore;
