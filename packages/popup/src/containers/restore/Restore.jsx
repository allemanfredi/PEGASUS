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
        this.comparePassword = this.comparePassword.bind(this);
        this.closeAlert = this.closeAlert.bind(this);

        this.state = {
            seed: '',
            psw: '',
            isLoading: false,
            seedIsValid: false,
            passwordIsValid: false,
            shake: false,
            error : null
        };
    }

    async onClickRestore(e) {
        e.preventDefault();

        const isSeedValid = await PopupAPI.isSeedValid(this.state.seed);
        if (!isSeedValid) {
            this.setState({
                isSeedValid,
                error : 'Invalid Seed'
            })
            return;
        }

        this.setState({ isLoading: true });

        //start encryption storage service
        PopupAPI.initStorageDataService(this.state.psw)

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

    async comparePassword(e) {
        e.preventDefault();

        this.setState({ shake: false });

        const canAccess = await PopupAPI.comparePassword(this.state.psw);
        if (canAccess)
            this.setState({ passwordIsValid: true });
        else this.setState({ shake: true });
    }

    onChangeSeed(e) {
        this.setState({ seed: e.target.value });
        const isValid = PopupAPI.isSeedValid(this.state.seed);
        if (isValid) {
            this.setState({ seedIsValid: true });
        } else this.setState({ seedIsValid: false });
    }

    closeAlert() {
        this.setState({
            error : null
        });
    }

    render() {
        return (

            this.state.isLoading ? <Loader /> : (

                <div className={this.state.shake ? 'container shake' : 'container'}>

                    <div className='row mt-3 mb-3'>
                        <div className='col-12 text-center text-lg text-blue'>Insert your password to restore the wallet</div>
                    </div>

                    {
                        this.state.passwordIsValid ?
                            <React.Fragment>
                                <div className='row mt-11'>
                                    <div className='col-1'></div>
                                    <div className='col-10 text-center'>
                                        <form onSubmit={this.onClickRestore}>
                                            <label htmlFor='inp-seed' className='inp '>
                                                <input value={this.state.seed} onChange={this.onChangeSeed} type='text' id='inp-seed' placeholder='&nbsp;' />
                                                <span className='label'>seed</span>
                                                <span className='border'></span>
                                            </label>
                                        </form>
                                    </div>
                                    <div className='col-1'></div>
                                </div>

                                {
                                    this.state.error ? 
                                        <div className="row mt-2">
                                            <div className='col-1'></div>
                                            <div className="col-10 text-xs">
                                                <div class="alert alert-danger" role="alert">
                                                    {this.state.error}
                                                </div>
                                            </div>
                                            <div className='col-1'></div>
                                        </div>
                                    : null
                                }

                                <div className='row mt-4'>
                                    <div className='col-1'></div>
                                    <div className='col-10 text-center'>
                                        <button disabled={this.state.seed.length > 0 ? false : true} onClick={this.onClickRestore} type='button' className='btn btn-blue text-bold btn-big'>Restore</button>
                                    </div>
                                    <div className='col-1'></div>
                                </div>

                            </React.Fragment>
                            :
                            <React.Fragment>
                                <div className='row mt-11'>
                                    <div className='col-1'></div>
                                    <div className='col-10 text-center'>
                                        <form onSubmit={this.comparePassword}>
                                            <label htmlFor='inp-psw' className='inp'>
                                                <input value={this.state.psw} onChange={e => this.setState({ psw: e.target.value })} type='password' id='inp-psw' placeholder='&nbsp;' />
                                                <span className='label'>psw</span>
                                                <span className='border'></span>
                                            </label>
                                        </form>
                                    </div>
                                    <div className='col-1'></div>
                                </div>

                                <div className='row mt-4'>
                                    <div className='col-1'></div>
                                    <div className='col-10 text-center'>
                                        <button disabled={this.state.psw.length > 0 ? false : true} onClick={this.comparePassword} type='button' className='btn btn-blue text-bold btn-big'>Unlock</button>
                                    </div>
                                    <div className='col-1'></div>
                                </div>
                            </React.Fragment>

                    }

                    <div className='row mt-3'>
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
