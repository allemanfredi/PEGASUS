import React, { Component } from 'react';
import { prepareTransfer } from '../../core/core';
import { getKey, getCurrentNetwork } from '../../wallet/wallet';
import { aes256decrypt } from '../../utils/crypto';

import Loader from '../../components/loader/Loader';
import Alert from '../../components/alert/Alert';

import { PopupAPI } from '@pegasus/lib/api';
import Utils from '@pegasus/lib/utils';

class Send extends Component {
    constructor(props, context) {
        super(props, context);

        this.clickTransfer = this.clickTransfer.bind(this);
        this.onCloseAlert = this.onCloseAlert.bind(this);

        this.state = {
            address: '',
            seed: '',
            dstAddress: '',
            value: '',
            message: '',
            isLoading: false,
            showAlert: false,
            alertText: '',
            alertType: ''
        };
    }

    onCloseAlert() {
        this.setState({ showAlert: false });
        this.setState({ alertText: '' });
        this.setState({ alertType: '' });
    }

    async clickTransfer() {
        this.setState({ isLoading: true });

        //decrypt seed;
        const key = await PopupAPI.getKey();
        const seed = Utils.aes256decrypt(this.props.account.seed, key);
        this.setState({ seed });

        const currentNewtwork = await PopupAPI.getCurrentNetwork();

        //const address = ''
        const transfer = {
            seed,
            tag: '',
            to: this.state.dstAddress,
            value: this.state.value,
            message: this.state.message,
            difficulty: currentNewtwork.difficulty
        };
        prepareTransfer(transfer, (bundle, error) => {
            if (bundle) {
                console.log(bundle);
                this.setState({ status: bundle });
                this.setState({ alertText: `Bundle : ${bundle}` });
                this.setState({ alertType: 'success' });
                this.setState({ showAlert: true });
            }
            if (error) {
                this.setState({ alertText: error.message });
                this.setState({ alertType: 'error' });
                this.setState({ showAlert: true });
            }

            this.setState({ dstAddress: '' });
            this.setState({ value: '' });
            this.setState({ message: '' });
            this.setState({ isLoading: false });
        });
    }

    render() {
        return (

            <div className="container">
                {!this.state.isLoading ?
                    <div>
                        <div className='row'>
                            <div className='col-12'>
                                <label htmlFor='inp-address' className='inp'>
                                    <input value={this.state.dstAddress} onChange={e => this.setState({ dstAddress: e.target.value })} type='text' id='inp-address' placeholder='&nbsp;' />
                                    <span className='label'>address</span>
                                    <span className='border'></span>
                                </label>
                            </div>
                        </div>

                        <div className='row'>
                            <div className='col-12'>
                                <label htmlFor='inp-value' className='inp'>
                                    <input value={this.state.value} onChange={e => this.setState({ value: e.target.value })} type='text' id='inp-value' placeholder='&nbsp;' />
                                    <span className='label'>value</span>
                                    <span className='border'></span>
                                </label>
                            </div>
                        </div>

                        <div className='row'>
                            <div className='col-12'>
                                <label htmlFor='inp-message' className='inp'>
                                    <input value={this.state.message} onChange={e => this.setState({ message: e.target.value })} type='text' id='inp-message' placeholder='&nbsp;' />
                                    <span className='label'>message</span>
                                    <span className='border'></span>
                                </label>
                            </div>
                        </div>

                        <div className='row'>
                            <div className='col-12 text-center'>
                                <button disabled={this.state.dstAddress === '' ? true : false} onClick={this.clickTransfer} className='btn btn-blue mt-5'>Send</button>
                            </div>
                        </div>
                    </div>
                    : <Loader />}
                {this.state.showAlert ? <Alert text={this.state.alertText} type={this.state.alertType} onClose={this.onCloseAlert} /> : ''}
            </div>
        );
    }
}

export default Send;