import React, { Component } from 'react';
import { getAccountData } from '../../core/core';

import Loader from '../../components/loader/Loader';
import options from '../../options/options';

import './Init.css';

import { PopupAPI } from '@pegasus/lib/api';
import Utils from '@pegasus/lib/utils';



class Init extends Component {
    constructor(props, context) {
        super(props, context);

        this.createWallet = this.createWallet.bind(this);
        this.goBack = this.goBack.bind(this);
        this.goOn = this.goOn.bind(this);
        this.updateStatusInitialization = this.updateStatusInitialization.bind(this);
        this.randomiseSeedLetter = this.randomiseSeedLetter.bind(this);
        this.copyToClipboard = this.copyToClipboard.bind(this);

        this.labelSeed = React.createRef();

        this.state = {
            psw: '',
            repsw: '',
            name: '',
            seed: [],
            randomLetters: 10,
            randomizedLetter: [],
            isLoading: false,
            initialization: [true, false, false, false],
            indexInitialization: 0,
            isCopiedToClipboard: false,
        };
    }

    async componentDidMount() {
        const seed = await PopupAPI.generateSeed();
        this.setState({ seed });
    }

    //action = true -> goOn, action = false = goBack
    goBack() {
        this.updateStatusInitialization(this.state.indexInitialization, false);
        this.setState({ indexInitialization: this.state.indexInitialization - 1 });
    }

    async goOn() {
        this.updateStatusInitialization(this.state.indexInitialization, true);
        this.setState({ indexInitialization: this.state.indexInitialization + 1 });

        if ( this.state.indexInitialization === 3) { //create wallet
            this.setState({ isLoading: true });
            await this.createWallet();
            this.setState({ isLoading: false });
            this.props.onSuccess();
        }
    }

    updateStatusInitialization(index, action) {
        this.setState(state => {
            const initialization = state.initialization;
            initialization[ index ] = false;
            action ? initialization[ index + 1 ] = true : initialization[ index - 1 ] = true;
            return {
                initialization,
            };
        });
    }

    async randomiseSeedLetter(index) {
        if ( !this.state.randomizedLetter.includes(index) && this.state.randomLetters > 0) {
            this.setState({ randomizedLetter: [...this.state.randomizedLetter, index] });
            this.setState({ randomLetters: this.state.randomLetters - 1 });
        }

        const letter = await PopupAPI.generateSeed(1)[0];
        console.log("reset ");
        console.log(letter);
        this.setState(state => {
            const seed = state.seed;
            seed[index] = letter;
            return {
                seed
            };
        });
    }

    copyToClipboard(e) {
        this.labelSeed.current.select();
        document.execCommand('copy');
        e.target.focus();
        this.setState({ isCopiedToClipboard: true });
    }

    async createWallet() {
        return new Promise( async (resolve, reject) => {
            try{
                if ( await PopupAPI.setupWallet() ) {
                    //store the psw
                    PopupAPI.storePsw(this.state.psw);

                    const seed = this.state.seed.toString().replace(/,/g, '');
                    const pswHash = Utils.sha256(this.state.psw);
                    const eseed = Utils.aes256encrypt(seed, pswHash);

                    //get all account data
                    const data = await getAccountData(seed);

                    const account = {
                        name: this.state.name,
                        seed: eseed,
                        data,
                        id: Utils.sha256(this.state.name),
                        network: options.network[ 0 ], //TESTNET = 1  MAINNET = 0
                        marketplace: { keys: Utils.generateKeys(), channels: [] }
                    };
                    await PopupAPI.addAccount(account, options.network[ 0 ], true);
                    await PopupAPI.setCurrentNetwork(options.network[ 0 ]);
                    resolve();
                }
            }catch(err) {
                console.log(err);
                reject('Impossible to create the wallet');
            }
        });
    }

    render() {
        return (
            <div>
                { this.state.isLoading ?
                    <Loader/>
                    : (<div>
                        <div className='container-logo'>
                            <img src='./material/logo/pegasus-128.png' height='80' width='80' alt='pegasus logo'/>
                        </div>
                        {this.state.initialization[ 0 ] ?
                            <div >
                                <div className='row'>
                                    <div className='col-1'></div>
                                    <div className='col-10 text-center'>
                                        <div className='row'>
                                            <div className='col-12 text-center name-text'>Let's add a name</div>
                                        </div>
                                        <div className='row'>
                                            <div className='col-12'>
                                                <label htmlFor='inp-name' className='inp'>
                                                    <input value={this.state.name} onChange={e => { this.setState({ name: e.target.value }); }} type='text' id='inp-name' placeholder='&nbsp;'/>
                                                    <span className='label'>name</span>
                                                    <span className='border'></span>
                                                </label>
                                            </div>
                                        </div>
                                    </div>
                                    <div className='col-1'></div>
                                </div>
                            </div>
                            : ''}

                        {this.state.initialization[ 1 ] ?
                            <div>
                                <div className='row'>
                                    <div className='col-1'></div>
                                    <div className='col-10 text-center'>
                                        <div className='row'>
                                            <div className='col-12 text-center psw-text'>Let's add a password</div>
                                        </div>

                                        <div className='row'>
                                            <div className='col-12'>
                                                <label htmlFor='inp-password' className='inp'>
                                                    <input value={this.state.psw} onChange={e => { this.setState({ psw: e.target.value }); }} type='password' id='inp-password' placeholder='&nbsp;'/>
                                                    <span className='label'>password</span>
                                                    <span className='border'></span>
                                                </label>
                                            </div>
                                        </div>

                                        <div className='row'>
                                            <div className='col-12'>
                                                <label htmlFor='inp-re-password' className='inp'>
                                                    <input value={this.state.repsw} onChange={e => { this.setState({ repsw: e.target.value }); }} type='password' id='inp-re-password' placeholder='&nbsp;'/>
                                                    <span className='label'>re-password</span>
                                                    <span className='border'></span>
                                                </label>
                                            </div>
                                        </div>

                                        <div className='row'>
                                            <div className='col-12 text-center text-psw-suggestion '>
                                        Password must contain at least 8 characters
                                            </div>
                                        </div>

                                    </div>
                                    <div className='col-1'></div>
                                </div>
                            </div>
                            : ''}

                        {this.state.initialization[ 2 ] ?
                            <div>
                                <div className='row'>
                                    <div className='col-1'></div>
                                    <div className='col-10 text-center'>
                                        <div className='row'>
                                            <div className='col-12 text-center seed-text'>Let's generate a seed</div>
                                        </div>

                                        <div className='row'>
                                            <div className='col-12 text-center seed-info-text'>
                                        Press <i className='remained-letters'>{this.state.randomLetters >= 0 ? this.state.randomLetters : 0}</i> more letters to randomise them
                                            </div>
                                        </div>

                                        <div className='container-seed-generation'>
                                            {[0, 9, 18, 27, 36, 45, 54, 63, 72].map(item => {
                                                return (
                                                    <div className='row'>
                                                        <div className='col-1'></div>
                                                        { Array.from(new Array(9), (x, i) => i + item).map( index => {
                                                            return (
                                                                <div className='col-1'>
                                                                    <div onClick={ () => this.randomiseSeedLetter(index) } className='container-letter'>{this.state.seed[ index ]}</div>
                                                                </div>
                                                            );
                                                        })}
                                                        <div className='col-1'></div>
                                                    </div>
                                                );
                                            })}
                                        </div>

                                    </div>
                                    <div className='col-1'></div>
                                </div>
                            </div>

                            : ''}

                        {this.state.initialization[ 3 ] ?
                            <div>
                                <div className='container-export-text'>
                                    <div className='row'>
                                        <div className='col-12 text-center'>Let's export the seed</div>
                                    </div>
                                </div>
                                <div className='container-export-suggestion'>
                                    <div className='row'>
                                        <div className='col-1 text-center'></div>
                                        <div className='col-10 text-center'>Take care to copy the seed in order to correctly reinitialize the wallet </div>
                                        <div className='col-1 text-center'></div>
                                    </div>
                                </div>
                                <div className='container-export-seed'>
                                    <div className='row'>
                                        <div className='col-1'></div>
                                        <div className='col-10 text-center'>
                                            <div className='container-seed-to-export'>
                                                <input className='input-seed-to-export' ref={this.labelSeed} value={this.state.seed.toString().replace(/,/g, '')} readOnly/>
                                            </div>
                                        </div>
                                        <div className='col-1'></div>
                                    </div>
                                </div>
                                <div className='container-export-seed-button'>
                                    <div className='row'>
                                        <div className='col-12 text-center'>
                                            <button onClick={this.copyToClipboard} className='btn btn-copy-seed'><span className='fa fa-clipboard'></span></button>
                                        </div>
                                    </div>
                                    <div className='row'>
                                        <div className='col-12 text-center'>
                                            <div className ='container-copy-to-clipboard'>
                                                {this.state.isCopiedToClipboard ? 'Copied!' : 'Copy to clipboard'}
                                            </div>
                                        </div>
                                    </div>
                                </div>

                            </div>
                            : '' }

                        <div className='container-menu-init'>
                            <div className='row'>
                                <div className='col-6 text-center padding-0'>
                                    <button disabled={this.state.initialization[ 0 ] ? true : false} onClick={this.goBack} type='submit' className='btn btn-menu-init-back'><span className='fa fa-arrow-left'></span></button>
                                </div>
                                <div className='col-6 text-center padding-0'>
                                    <button disabled={this.state.initialization[ 0 ] ? (this.state.name.length > 0 ? false : true ) :
                                        this.state.initialization[ 1 ] ? (this.state.psw.length > 7 && (this.state.psw === this.state.repsw) ? false : true) :
                                            this.state.initialization[ 2 ] ? (this.state.randomLetters === 0 ? false : true) : ''}
                                    onClick={this.goOn}
                                    type='submit'
                                    className='btn btn-menu-init-option'
                                    ><span className='fa fa-arrow-right'></span>
                                    </button>
                                </div>
                            </div>
                        </div>

                       </div>
                    )}
            </div>
        );
    }
}

export default Init;
