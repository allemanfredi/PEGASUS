import React, { Component } from 'react';
import { prepareTransfer } from '../../core/core';
import { getKey, getCurrentNewtwork } from '../../wallet/wallet';
import { aes256decrypt } from '../../utils/crypto';

import Loader from '../../components/loader/Loader';
import Alert from '../../components/alert/Alert';

import './Send.css';

class Send extends Component {
    constructor(props, context) {
        super(props, context);

        this.clickTransfer = this.clickTransfer.bind(this);
        this.handleChangeDstAddress = this.handleChangeDstAddress.bind(this);
        this.handleChangeValue = this.handleChangeValue.bind(this);
        this.handleChangeMessage = this.handleChangeMessage.bind(this);
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

    handleChangeDstAddress(e) {
        this.setState({ dstAddress: e.target.value });
    }

    handleChangeValue(e) {
        this.setState({ value: e.target.value });
    }

    handleChangeMessage(e) {
        this.setState({ message: e.target.value });
    }

    onCloseAlert() {
        this.setState({ showAlert: false });
        this.setState({ alertText: '' });
        this.setState({ alertType: '' });
    }

    async clickTransfer() {
        this.setState({ isLoading: true });

        //decrypt seed;
        const key = await getKey();
        const seed = aes256decrypt(this.props.account.seed, key);
        this.setState({ seed });

        //const address = 'IETGETEQSAAJUCCKDVBBGPUNQVUFNTHNMZYUCXXBFXYOOOQOHC9PTMP9RRIMIOQRDPATHPVQXBRXIKFDDRDPQDBWTY'
        const transfer = {
            seed,
            tag: '',
            to: this.state.dstAddress,
            value: this.state.value,
            message: this.state.message,
            difficulty: getCurrentNewtwork().type === 'mainnet' ? 14 : 9
        };
        prepareTransfer( transfer, (bundle, error) => {
            if (bundle) {
                console.log(bundle);
                this.setState({ status: bundle });
                this.setState({ alertText: `Bundle : ${ bundle}` });
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

            <div>
                { !this.state.isLoading ?

                    <div className='container-send'>
                        <div className='row'>
                            <div className='col-1'></div>
                            <div className='col-10'>
                                <label htmlFor='inp-address' className='inp'>
                                    <input value={this.state.dstAddress} onChange={this.handleChangeDstAddress} type='text' id='inp-address' placeholder='&nbsp;'/>
                                    <span className='label'>address</span>
                                    <span className='border'></span>
                                </label>
                            </div>
                            <div className='col-1'></div>
                        </div>

                        <div className='row'>
                            <div className='col-1'></div>
                            <div className='col-10'>
                                <label htmlFor='inp-value' className='inp'>
                                    <input value={this.state.value} onChange={this.handleChangeValue} type='text' id='inp-value' placeholder='&nbsp;'/>
                                    <span className='label'>value</span>
                                    <span className='border'></span>
                                </label>
                            </div>
                            <div className='col-1'></div>
                        </div>

                        <div className='row'>
                            <div className='col-1'></div>
                            <div className='col-10'>
                                <label htmlFor='inp-message' className='inp'>
                                    <input value={this.state.message} onChange={this.handleChangeMessage} type='text' id='inp-message' placeholder='&nbsp;'/>
                                    <span className='label'>message</span>
                                    <span className='border'></span>
                                </label>
                            </div>
                            <div className='col-1'></div>
                        </div>

                        <div className='row'>
                            <div className='col-1'></div>
                            <div className='col-10 text-center'>
                                <button disabled={this.state.dstAddress === '' ? true : false} onClick={this.clickTransfer} className='btn btn-transfer'><i className='fa fa-paper-plane' ></i></button>
                            </div>
                            <div className='col-1'></div>
                        </div>

                        <div className='row'>
                            <div className='col-1'></div>
                            <div className='col-10 text-center'>
                                <div className='text-transfer'>Send</div>
                            </div>
                            <div className='col-1'></div>
                        </div>
                    </div>
                    : <Loader/>}
                {this.state.showAlert ? <Alert text={this.state.alertText} type={this.state.alertType} onClose={this.onCloseAlert}/> : ''}
            </div>
        );
    }
}

export default Send;