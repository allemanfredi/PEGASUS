import React, { Component } from 'react';
import { checkPsw } from '../../wallet/wallet';

import { PopupAPI } from '@pegasus/lib/api';
import Utils from '@pegasus/lib/utils';


class InitPsw extends Component {
    constructor(props, context) {
        super(props, context);

        this.clickLogin = this.clickLogin.bind(this);
        this.handleChangePsw = this.handleChangePsw.bind(this);

        this.state = {
            psw: '',
            error: '',
            isLoginable : false
        };
    }

    clickLogin() {
        PopupAPI.startSession();
        this.props.onSuccess();
    }

    async handleChangePsw(e) {
        this.setState({ showError: false });
        this.setState({ psw: e.target.value });
        
        const canAccess = await PopupAPI.checkPsw(this.state.psw)
        if (canAccess){
            this.setState({isLoginable:true});
        }else{
            this.setState({isLoginable:false});
        }
    }

    render() {
        return (
            <div className='container'>
                <div className='container-logo-login mt-5'>
                    <img src='./material/logo/pegasus-128.png' height='80' width='80' alt='pegasus logo'/>
                </div>
                <div className='row'>
                    <div className='col-12 text-center text-lg text-blue mt-1'>
                Pegasus
                    </div>
                </div>
                <div className='row mt-5'>
                    <div className='col-1'></div>
                    <div className='col-10'>
                        <label htmlFor='inp-psw ' className='inp'>
                            <input onChange={this.handleChangePsw} type='password' id='inp-psw' placeholder='&nbsp;'/>
                            <span className='label'>password</span>
                            <span className='border'></span>
                        </label>
                    </div>
                    <div className='col-1'></div>
                </div>
                <div className='row mt-4'>
                    <div className='col-1'></div>
                    <div className='col-10 text-center'>
                        <button disabled={!this.state.isLoginable} onClick={this.clickLogin} type='submit' className='btn btn-blue text-bold'>Login</button>
                    </div>
                    <div className='col-1'></div>
                </div>
                <div className='row mt-1'>
                    <div className='col-1'></div>
                    <div className='col-10 text-center'>
                        <button onClick={e => { this.props.onRestore(); }} type='submit' className='btn btn-white '>Restore from seed</button>
                    </div>
                    <div className='col-1'></div>
                </div>
            </div>
        );
    }
}

export default InitPsw;