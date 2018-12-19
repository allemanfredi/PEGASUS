import React , { Component } from 'react';
import {storePsw} from '../../wallet/wallet'
import history from '../../components/history';
import {aes256encrypt,sha256} from '../../utils/crypto'
import {getAccountData} from '../../core/core';
import {generateSeed,addAccount,setupWallet,setCurrentNetwork} from '../../wallet/wallet';

import options from '../../options/options';

import './Init.css';

class Init extends Component {

    constructor(props, context) {
      super(props, context);

      this.handleChangePsw = this.handleChangePsw.bind(this);
      this.handleChangeRePsw = this.handleChangeRePsw.bind(this);
      this.handleChangeName = this.handleChangeName.bind(this);
      this.clickGoToCreatePsw = this.clickGoToCreatePsw.bind(this);
      this.clickGoToCreateSeed = this.clickGoToCreateSeed.bind(this);

      this.clickGenerateSeed = this.clickGenerateSeed.bind(this);
      this.clickCreateWallet = this.clickCreateWallet.bind(this);

      this.copySeed = this.copySeed.bind(this);

      this.state = {
        psw: '',
        repsw: '',
        error: '',
        name : '',
        isLoading : '',
        showGeneratePsw: false,
        showGenerateSeed: false,
        showGenerateName: true,
        showError: false
      };
    }

    clickGoToCreatePsw(){
        if ( this.state.name.length !== 0 ){
            this.setState({error : false});
            this.setState({showGenerateName : false});
            this.setState({showGeneratePsw : true});
        }else{
            this.setState({showError : true});
            this.setState({error : 'Please insert a valid name.'});
        }
    }

    clickGoToCreateSeed(){
        if ( this.state.psw.length === 0  ){
            this.setState({showError : true});
            this.setState({error : 'Please insert a valid password.'});
            return;
        }
        if ( this.state.psw === this.state.repsw  ){
            if ( storePsw(this.state.psw)){
                this.setState({showError : false});
                this.setState({showGeneratePsw : false});
                this.setState({showGenerateSeed : true});
            }else{
                this.setState({showError : true});
                this.setState({error : 'Impossible to store the password.'});
            }
        }else{
            this.setState({showError : true});
            this.setState({error : 'Password do not match.'});
        }
    }

    clickGenerateSeed(){
        this.setState({seed: generateSeed() });
    }

    handleChangePsw(e) {
        this.setState({showError : false});
        this.setState({ psw: e.target.value });
    }

    handleChangeRePsw(e) {
        this.setState({showError : false});
        this.setState({ repsw: e.target.value });
    }

    handleChangeName(e) {
        this.setState({showError : false});
        this.setState({ name: e.target.value });
    }

    copySeed(){
        console.log("copy to do");
    }
  

    async clickCreateWallet() {
        if ( !this.state.seed){
            this.setState({showError : true});
            this.setState({error : 'Please first generate a seed'});
            return;
        }

        this.setState({isLoading : true});

        try{
            if ( setupWallet() ){
                
                //TODO: come salvare la psw in plaintext (sol: session storage )
                //piu sicuro: chiedere la psw per ogni send cosi da salvare solo l'hash della psw
                //mi tengo la chiave di cifratura del seed nella ram invece che salvarmela nel session storage
                const pswHash = sha256(this.state.psw);
                const eseed = aes256encrypt(this.state.seed,pswHash);

                //get all account data
                console.log("get account data " + this.state.seed );
                const data = await getAccountData(this.state.seed);
                
                const account = {
                    name : this.state.name,
                    seed : eseed,
                    data : data,
                    network : options.network[0] //TESTNET = 0  MAINNET = 1 PER ADESSO GENERO SULLA TESTNET
                }
                await addAccount(account);
                await setCurrentNetwork(options.network[0]);

                history.push('/home');
            }
        }catch(err){
            console.log(err.error);
            this.setState({isLoading : true});
        }
    }

    
    render() {
      return (
       <div>
           { this.state.isLoading ? 
                <div class="container-loader"><div class="loader"></div></div>
            : (<div>
                   {this.state.showGenerateName ?  
                        <div class="container-center">
                            <div class="row">
                                <div class="col-2"></div>
                                <div class="col-8">
                                    <form>
                                        <div class="form-group">
                                            <input onChange={this.handleChangeName} type="text" class="form-control input-name" placeholder="Insert your name"/>
                                        </div>
                                    </form>
                                </div>
                                <div class="col-2"></div>
                            </div>
                            <div class="row">
                                <div class="col-2"></div>
                                <div class="col-8 text-center">
                                    <button onClick={this.clickGoToCreatePsw} type="submit" class="btn btn-name">Create Password <span class="fa fa-arrow-right"></span></button>
                                </div>
                                <div class="col-2"></div>
                            </div>
                        </div>
                   : ''}

                   {this.state.showGeneratePsw ? 
                        <div class="container-center">
                            <div class="row">
                                <div class="col-2"></div>
                                <div class="col-8">
                                    <form>
                                        <div class="form-group">
                                            <input onChange={this.handleChangePsw} type="password" class="form-control input-psw" placeholder="Insert your password"/>
                                            <input onChange={this.handleChangeRePsw} type="password" class="form-control input-psw" placeholder="Re-Insert your password"/>
                                        </div>
                                    </form>
                                </div>
                                <div class="col-2"></div>
                            </div>
                            <div class="row">
                                <div class="col-2"></div>
                                <div class="col-8 text-center">
                                    <button onClick={this.clickGoToCreateSeed} type="submit" class="btn btn-password">Create Seed <span class="fa fa-arrow-right"></span></button>
                                </div>
                                <div class="col-2"></div>
                            </div>
                        </div>
                    : ''}

                   {this.state.showGenerateSeed ? 
                        
                        <div class="container-center">
                            <div class="row">
                                <div class="col-2"></div>
                                <div class="col-8 text-center">
                                    <button onClick={this.clickGenerateSeed} type="submit" class="btn btn-generate-seed">Generate Seed </button>
                                </div>
                                <div class="col-2"></div>
                            </div>

                            { this.state.seed ? 
                                <div>
                                    <div class="row">
                                        <div class="col-2"></div>
                                        <div class="col-8 ">
                                            <label class="label-seed" >{this.state.seed}</label>
                                        </div>
                                        <div class="col-2"></div>
                                    </div>
                                    <div class="row">
                                        <div class="col-2"></div>
                                            <div class="col-8 text-center">
                                            <button onClick={this.copySeed} type="submit" class="btn btn-copy-seed"><span class="fa fa-bookmark"></span></button>
                                            </div>
                                        <div class="col-2"></div>
                                    </div>
                                </div>
                            : ''}

                            <div class="row">
                                <div class="col-2"></div>
                                <div class="col-8 text-center">
                                    <button onClick={this.clickCreateWallet} type="submit" class="btn btn-create-wallet">Create wallet </button>
                                </div>
                                <div class="col-2"></div>
                            </div>
                        </div>  
                    : ''}

                    {this.state.showError ? 
                        <div class="alert alert-danger" role="alert">
                            <strong>Error</strong> {this.state.error}
                        </div>
                    : ''}
                
                </div>
           )}
       </div>
      );
    }
  }

export default Init;