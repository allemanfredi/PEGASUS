import React , { Component } from 'react';
import {storePsw} from '../../wallet/wallet'
import {aes256encrypt,sha256} from '../../utils/crypto'
import {getAccountData} from '../../core/core';
import {generateSeed,addAccount,setupWallet,setCurrentNetwork} from '../../wallet/wallet';

import Loader from '../../components/loader/Loader'
import options from '../../options/options';

import './Init.css';

class Init extends Component {

    constructor(props, context) {
      super(props, context);

      this.clickGoToCreatePsw = this.clickGoToCreatePsw.bind(this);
      this.clickGoToCreateSeed = this.clickGoToCreateSeed.bind(this);
      this.clickGenerateSeed = this.clickGenerateSeed.bind(this);
      this.clickCreateWallet = this.clickCreateWallet.bind(this);
      this.copySeed = this.copySeed.bind(this);

      this.state = {
        psw: '',
        repsw: '',
        name : '',
        seed : '',
        isLoading : false,
        showGeneratePsw: false,
        showGenerateSeed: false,
        showGenerateName: true,
      };
    }

    clickGoToCreatePsw(){
        if ( this.state.name.length !== 0 ){
            this.setState({showGenerateName : false});
            this.setState({showGeneratePsw : true});
        }else{
        }
    }

    clickGoToCreateSeed(){
        if ( storePsw(this.state.psw)){
            this.setState({showGeneratePsw : false});
            this.setState({showGenerateSeed : true});
        }else{
        }
    }

    clickGenerateSeed(){
        this.setState({seed: generateSeed() });
    }

    copySeed(){
        console.log("copy to do");
    }
  

    async clickCreateWallet() {
        this.setState({isLoading : true});

        try{
            if ( setupWallet() ){
                
                //TODO: come salvare la psw in plaintext (sol: session storage )
                //piu sicuro: chiedere la psw per ogni send cosi da salvare solo l'hash della psw
                //mi tengo la chiave di cifratura del seed nella ram invece che salvarmela nel session storage
                const pswHash = sha256(this.state.psw);
                const eseed = aes256encrypt(this.state.seed,pswHash);

                //get all account data
                const data = await getAccountData(this.state.seed);
                
                const account = {
                    name : this.state.name,
                    id : sha256(this.state.name),
                    seed : eseed,
                    data : data,
                    network : options.network[0] //TESTNET = 0  MAINNET = 1 PER ADESSO GENERO SULLA TESTNET
                }
                await addAccount(account);
                await setCurrentNetwork(options.network[0]);
                
                this.props.onSuccess();
            }
        }catch(err){
            console.log(err);
            this.setState({isLoading : false});
        }
    }

    
    render() {
      return (
       <div>
           { this.state.isLoading ? 
                <Loader/>
            : (<div>
                    <div class="container-logo">
                        <img src="./material/logo/pegasus-128.png" height="80" width="80"/>
                    </div>
                   {this.state.showGenerateName ?  
                        <div class="container-center">
                            <div class="row">
                                <div class="col-1"></div>
                                <div class="col-10">
                                    <form>
                                        <label for="inp-name" class="inp">
                                            <input onChange={e => {this.setState({name: e.target.value})}} type="text" id="inp-name" placeholder="&nbsp;"/>
                                            <span class="label">name</span>
                                            <span class="border"></span>
                                        </label>
                                    </form>
                                </div>
                                <div class="col-1"></div>
                            </div>
                            <div class="row">
                                <div class="col-1"></div>
                                <div class="col-10 text-center">
                                    <button disabled={this.state.name.length === 0 ? true : false} onClick={this.clickGoToCreatePsw} type="submit" class="btn btn-name">CREATE PASSWORD <span class="fa fa-arrow-right"></span></button>
                                </div>
                                <div class="col-1"></div>
                            </div>
                        </div>
                   : ''}

                   {this.state.showGeneratePsw ? 
                        <div class="container-center">
                            <div class="row">
                                <div class="col-1"></div>
                                <div class="col-10">
                                    <label for="inp-password" class="inp">
                                        <input onChange={e => {this.setState({psw: e.target.value})}}  type="password" id="inp-password" placeholder="&nbsp;"/>
                                        <span class="label">password</span>
                                        <span class="border"></span>
                                    </label>
                                </div>
                                <div class="col-1"></div>
                            </div>
                            <div class="row">
                                <div class="col-1"></div>
                                <div class="col-10">
                                    <label for="inp-re-password" class="inp">
                                        <input onChange={e => {this.setState({repsw: e.target.value})}} type="password" id="inp-re-password" placeholder="&nbsp;"/>
                                        <span class="label">re-password</span>
                                        <span class="border"></span>
                                    </label>
                                </div>
                                <div class="col-1"></div>
                            </div>
                            <div class="row">
                                <div class="col-1"></div>
                                <div class="col-10 text-center">
                                    <button disabled={this.state.psw.length !== 0 && (this.state.psw === this.state.repsw) ? false : true} onClick={this.clickGoToCreateSeed} type="submit" class="btn btn-password">CREATE SEED <span class="fa fa-arrow-right"></span></button>
                                </div>
                                <div class="col-1"></div>
                            </div>
                        </div>
                    : ''}

                   {this.state.showGenerateSeed ? 
                        
                        <div class="container-center">
                            <div class="row">
                                <div class="col-1"></div>
                                <div class="col-10 text-center">
                                    <button onClick={this.clickGenerateSeed} type="submit" class="btn btn-generate-seed">GENERATE SEED</button>
                                </div>
                                <div class="col-1"></div>
                            </div>

                            { this.state.seed ? 
                                <div>
                                    <div class="row">
                                        <div class="col-1"></div>
                                        <div class="col-10 ">
                                            <label class="label-seed" >{this.state.seed}</label>
                                        </div>
                                        <div class="col-1"></div>
                                    </div>
                                    <div class="row">
                                        <div class="col-1"></div>
                                            <div class="col-10 text-center">
                                            <button onClick={this.copySeed} type="submit" class="btn btn-copy-seed"><span class="fa fa-bookmark"></span></button>
                                            </div>
                                        <div class="col-1"></div>
                                    </div>
                                </div>
                            : ''}

                            <div class="row">
                                <div class="col-1"></div>
                                <div class="col-10 text-center">
                                    <button disabled={this.state.seed.length > 0 ? false : true} onClick={this.clickCreateWallet} type="submit" class="btn btn-create-wallet">CREATE WALLET</button>
                                </div>
                                <div class="col-1"></div>
                            </div>
                        </div>  
                    : ''}

                
                </div>
           )}
       </div>
      );
    }
  }

export default Init;