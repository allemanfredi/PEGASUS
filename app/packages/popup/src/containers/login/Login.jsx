import React, { Component } from 'react';
import { checkPassword } from '../../wallet/wallet';

import { PopupAPI } from '@pegasus/lib/api';
import Utils from '@pegasus/lib/utils';


class InitPsw extends Component {
    constructor(props, context) {
        super(props, context);

        this.clickLogin = this.clickLogin.bind(this);

        this.state = {
            psw: '',
            error: '',
            shake : false
        };
    }

    async clickLogin() {
        this.setState({shake:false});
        
        const canAccess = await PopupAPI.checkPassword(this.state.psw)
        if ( canAccess ){
            PopupAPI.setPassword(this.state.psw);
            PopupAPI.startSession();
            this.props.onSuccess();
        }else{
            this.setState({shake:true});
        }
    }

    render() {
        return (
            <div className={this.state.shake ? 'container shake' : 'container'}>
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
                            <input onChange={e => this.setState({ psw: e.target.value })} type='password' id='inp-psw' placeholder='&nbsp;'/>
                            <span className='label'>password</span>
                            <span className='border'></span>
                        </label>
                    </div>
                    <div className='col-1'></div>
                </div>
                <div className='row mt-4'>
                    <div className='col-1'></div>
                    <div className='col-10 text-center'>
                        <button disabled={!this.state.psw.length > 0} onClick={this.clickLogin} type='submit' className='btn btn-blue text-bold btn-big'>Login</button>
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