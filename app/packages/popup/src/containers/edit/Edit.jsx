import React, { Component } from 'react';
import Alert from '../../components/alert/Alert';

import { PopupAPI } from '@pegasus/lib/api';

import './Edit.css';

class Edit extends Component {
    constructor(props, context) {
        super(props, context);

        this.deleteAccount = this.deleteAccount.bind(this);
        this.onCloseAlert = this.onCloseAlert.bind(this);

        this.state = {
            name: '',
            isLoading: false,
            showAlert: false,
            alertType: '',
            alerText: ''

        };
    }

    async componentDidMount() {
        this.setState({ name: this.props.account.name });
    }

    async deleteAccount() {
        try{
            await PopupAPI.deleteAccount(this.props.account, this.props.network);
            this.props.onDeleteAccount();
        }catch(err) {
            this.setState({ showAlert: true });
            this.setState({ alertType: 'error' });
            this.setState({ alerText: err.message });
        }
    }

    onCloseAlert() {
        this.setState({ showAlert: false });
        this.setState({ alerText: '' });
        this.setState({ alertType: '' });
    }

    render() {
        return (
            <div className='modal'>
                <div className='container-edit'>
                    <div className='row'>
                        <div className='col-2 text-center'>
                            <button onClick={() => { this.props.onClose(); }} type='button' className='close' aria-label='Close'>
                                <span aria-hidden='true'>&times;</span>
                            </button>
                        </div>
                        <div className='col-10 text-center'></div>
                    </div>
                    <div className='row'>
                        <div className='col-1'></div>
                        <div className='col-10'>
                            <label htmlFor='inp-name' className='inp'>
                                <input value={this.state.name} onChange={e => { this.setState({ name: e.target.value }); }} type='text' id='inp-name' placeholder='&nbsp;'/>
                                <span className='label'>name</span>
                                <span className='border'></span>
                            </label>
                        </div>
                        <div className='col-1'></div>
                    </div>
                    <div className='row'>
                        <div className='col-1'></div>
                        <div className='col-5 text-left'>
                            <button onClick={() => this.props.onChangeName(this.state.name)} disabled={this.state.name.length > 0 ? false : true} className='btn btn-update'>Update <span className='fa fa-check'></span></button>
                        </div>
                        <div className='col-5 text-right'>
                            <button onClick={() => this.deleteAccount()} className='btn btn-delete'>Delete <span className='fa fa-times'></span></button>
                        </div>
                        <div className='col-1'></div>
                    </div>
                </div>
                {this.state.showAlert ? <Alert text={this.state.alerText} type={this.state.alertType} onClose={this.onCloseAlert}/> : ''}
            </div>
        );
    }
}

export default Edit;
