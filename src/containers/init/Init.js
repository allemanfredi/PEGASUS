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

      this.createWallet = this.createWallet.bind(this);
      this.copySeed = this.copySeed.bind(this);
      this.goBack = this.goBack.bind(this);
      this.goOn = this.goOn.bind(this);
      this.updateStatusInitialization = this.updateStatusInitialization.bind(this);
      this.randomiseSeedLetter = this.randomiseSeedLetter.bind(this);
      //this.resetSeed = this.resetSeed.bind(this);

      this.state = {
        psw: '',
        repsw: '',
        name : '',
        seed : '',
        randomLetters : 10,
        randomizedLetter : [],
        isLoading : false,
        initialization : [true,false,false],
        indexInitialization : 0,
      };
    }

    async componentDidMount() {
        const seed = generateSeed();
        this.setState({seed: seed});
    }


    copySeed(){
        console.log("copy to do");
    }

    //action = true -> goOn, action = false = goBack
    goBack(){
        this.updateStatusInitialization(this.state.indexInitialization,false);
        this.setState({indexInitialization : this.state.indexInitialization -1});
    }

    async goOn(){
        this.updateStatusInitialization(this.state.indexInitialization,true);
        this.setState({indexInitialization : this.state.indexInitialization + 1});

        if ( this.state.indexInitialization === 2){//create wallet
            this.setState({isLoading : true});
            await this.createWallet();
            this.setState({isLoading : false});
            this.props.onSuccess();
        }
    }
  
    updateStatusInitialization(index,action){
        this.setState(state => {
            const initialization = state.initialization;
            initialization[index] = false;
            action ? initialization[index+1] = true : initialization[index-1] = true;
            return {
              initialization,
            };
        });
    }

    randomiseSeedLetter(index){
        if ( !this.state.randomizedLetter.includes(index) && this.state.randomLetters > 0){
            this.setState({randomizedLetter: [...this.state.randomizedLetter, index]});
            this.setState({randomLetters: this.state.randomLetters - 1});
        }
        
        this.setState(state => {
            const values = '9ABCDEFGHIJKLMNOPQRSTUVWXYZ';
            const letter = values[Math.floor(Math.random() * values.length)];
            const seed = state.seed.substr(0, index) + letter + state.seed.substr(index + letter.length);
            return {
                seed
            }
        })
    }

    /*resetSeed(){
        const seed = generateSeed();
        this.setState({seed: seed});
        this.setState({randomLetters: 10});
        this.setState({randomizedLetter: []});
    }*/

    async createWallet() {
        return new Promise ( async (resolve,reject) => {
            try{
                if ( setupWallet() ){
                    
                    //store the psw
                    storePsw(this.state.psw);
    
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
                    resolve();
                }
            }catch(err){
                console.log(err);
                reject("Impossible to create the wallet");
            }
        })
        
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
                   {this.state.initialization[0] ?  
                        <div>
                            <div class="container-name-text">
                                <div class="row">
                                    <div class="col-12 text-center">Let's add a name</div>
                                </div>
                            </div>
                            <div class="container-name-init">
                                <div class="row">
                                    <div class="col-1"></div>
                                    <div class="col-10">
                                        <label for="inp-name" class="inp">
                                            <input value={this.state.name} onChange={e => {this.setState({name: e.target.value})}} type="text" id="inp-name" placeholder="&nbsp;"/>
                                            <span class="label">name</span>
                                            <span class="border"></span>
                                        </label>
                                    </div>
                                    <div class="col-1"></div>
                                </div>
                            </div>
                        </div>
                        

                   : ''}

                   {this.state.initialization[1] ? 
                    <div>
                        <div class="container-psw-text">
                                <div class="row">
                                    <div class="col-12 text-center">Let's add a password</div>
                                </div>
                        </div>
                        <div class="container-psw-init">
                            <div class="row">
                                <div class="col-1"></div>
                                <div class="col-10">
                                    <label for="inp-password" class="inp">
                                        <input value={this.state.psw} onChange={e => {this.setState({psw: e.target.value})}}  type="password" id="inp-password" placeholder="&nbsp;"/>
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
                                        <input value={this.state.repsw} onChange={e => {this.setState({repsw: e.target.value})}} type="password" id="inp-re-password" placeholder="&nbsp;"/>
                                        <span class="label">re-password</span>
                                        <span class="border"></span>
                                    </label>
                                </div>
                                <div class="col-1"></div>
                            </div>
                        </div>
                        <div class="container-psw-suggestion">
                            <div class="row">
                                <div class="col-12 text-center">
                                    Password must contain at least 8 characters
                                </div>
                            </div>
                        </div>
                    </div>
                    : ''}

                   {this.state.initialization[2]  ? 
                        <div>
                            <div class="container-seed-text">
                                <div class="row">
                                    <div class="col-12 text-center">Let's generate a seed</div>
                                </div>
                            </div>
                            { this.state.randomLetters > 0 ?
                                <div class="container-randomise">
                                    <div class="row">
                                        <div class="col-12 text-center">
                                            Press <i class="remained-letters">{this.state.randomLetters}</i> more letters to randomise them
                                        </div>
                                    </div>
                                </div>
                            : ''}
                            <div class="container-seed-init">
                                {[0,9,18,27,36,45,54,63,72].map(item => {
                                    return (
                                        <div class="row">
                                            <div class="col-1"></div>
                                            { Array.from(new Array(9), (x,i) => i+item).map( index => {
                                                return (
                                                    <div class="col-1">
                                                        <div onClick={ () => this.randomiseSeedLetter(index) } class="container-letter">{this.state.seed[index]}</div>
                                                    </div>
                                                )
                                            })}
                                            <div class="col-1"></div>
                                        </div>
                                    )
                                })}
                            </div>  
                        </div>
                    : ''}
                    
                    <div class="container-menu-init">
                        <div class="row">
                            <div class="col-6 text-center padding-0">
                                <button disabled={this.state.initialization[0] ? true : false} onClick={this.goBack} type="submit" class="btn btn-menu-init-back"><span class="fa fa-arrow-left"></span></button>
                            </div>
                            <div class="col-6 text-center padding-0">
                                <button disabled={this.state.initialization[0] ? (this.state.name.length > 0 ? false : true ) : 
                                                  this.state.initialization[1] ? (this.state.psw.length > 7 && (this.state.psw === this.state.repsw) ? false : true) : 
                                                  this.state.initialization[2] ? (this.state.randomLetters === 0 ? false : true) : ''}
                                        onClick={this.goOn}
                                        type="submit" 
                                        class="btn btn-menu-init-option"><span class="fa fa-arrow-right"></span></button>
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
