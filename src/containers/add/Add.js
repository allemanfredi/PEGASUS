/*import React, { Component } from 'react';
import {getCurrentNewtwork,addAccount,getKey,generateSeed} from '../../wallet/wallet'
import {getAccountData} from '../../core/core';
import {aes256encrypt,sha256} from '../../utils/crypto';

import Loader from '../../components/loader/Loader'

import './Add.css';

class Add extends Component {

    constructor(props,context) {
        super(props,context);
        
        this.onClickAddAccount = this.onClickAddAccount.bind(this);
        this.handleChangeName = this.handleChangeName.bind(this);

        this.state = {
            name : '',
            isLoading : false
        }
    }

    handleChangeName(e){
        this.setState({name : e.target.value});
    }

    async onClickAddAccount(){
        this.setState({isLoading:true});

        const currentNetwork = await getCurrentNewtwork();
        const seed = generateSeed();
        const key = await getKey()
        const eseed = aes256encrypt(seed,key);

        //get all account data
        const data = await getAccountData(seed);
        const account = {
            name : this.state.name,
            id : sha256(this.state.name),
            seed : eseed,
            data : data,
            network : currentNetwork
        }
        await addAccount(account,true); //new current account
        this.props.onChangeAccount(account);
        
        //reset label
        this.setState({name : ''});
        this.setState({isLoading:false});
    }

    
    render() {
        return (
            <div>
                { this.state.isLoading ? <Loader></Loader> : (
                <div class="container-add-account">
                    <div class="row">
                        <div class="col-1"></div>
                        <div class="col-10 text-center">
                            <label for="inp-name" class="inp">
                                <input value={this.state.name} onChange={this.handleChangeName} type="text" id="inp-name" placeholder="&nbsp;"/>
                                <span class="label">name</span>
                                <span class="border"></span>
                            </label>
                        </div>
                        <div class="col-1"></div>
                    </div>
                    <div class="row">
                        <div class="col-1"></div>
                        <div class="col-10 text-center">
                            <button disabled={this.state.name.length > 0 ? false : true} onClick={this.onClickAddAccount} type="button" class="btn btn-add"><i class="fa fa-plus icon" ></i></button>
                        </div>
                        <div class="col-1"></div>
                    </div>
                    <div class="row">
                        <div class="col-1"></div>
                        <div class="col-10 text-center">Add account</div>
                        <div class="col-1"></div>
                    </div>

                </div>
                )}
            </div>
        );
    }
}

export default Add;*/

import React , { Component } from 'react';
import {aes256encrypt,sha256} from '../../utils/crypto'
import {getAccountData} from '../../core/core';
import {generateSeed,addAccount,getKey,getCurrentNewtwork} from '../../wallet/wallet';

import Loader from '../../components/loader/Loader'

import './Add.css';

class Add extends Component {

    constructor(props, context) {
      super(props, context);

      this.addAccount = this.addAccount.bind(this);
      this.goBack = this.goBack.bind(this);
      this.goOn = this.goOn.bind(this);
      this.updateStatusInitialization = this.updateStatusInitialization.bind(this);
      this.randomiseSeedLetter = this.randomiseSeedLetter.bind(this);

      this.state = {
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

    goBack(){
        this.updateStatusInitialization(this.state.indexInitialization,false);
        this.setState({indexInitialization : this.state.indexInitialization -1});
    }

    async goOn(){
        this.updateStatusInitialization(this.state.indexInitialization,true);
        this.setState({indexInitialization : this.state.indexInitialization + 1});

        if ( this.state.indexInitialization === 2){
            this.setState({isLoading : true});
            const newAccount = await this.addAccount();
            this.setState({isLoading : false});
            this.props.onChangeAccount(newAccount);
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

    async addAccount() {
        return new Promise ( async (resolve,reject) => {
            try{
                const currentNetwork = await getCurrentNewtwork();
                const seed = generateSeed();
                const key = await getKey()
                const eseed = aes256encrypt(seed,key);
        
                //get all account data
                const data = await getAccountData(seed);
                const account = {
                    name : this.state.name,
                    id : sha256(this.state.name),
                    seed : eseed,
                    data : data,
                    network : currentNetwork
                }
                await addAccount(account,true); 
                resolve(account);
                
            }catch(err){
                console.log(err);
                reject("Impossible to create the account");
            }
        })
        
    }

    
    render() {
      return (
       <div>
           { this.state.isLoading ? 
                <Loader/>
            : (<div>
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


                   {this.state.initialization[1]  ? 
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

                    {this.state.initialization[2]  ?
                        <div>
                            <div class="container-export-text">
                                <div class="row">
                                    <div class="col-12 text-center">Let's export the seed</div>
                                </div>
                            </div>
                            <div class="container-export-suggestion">
                                <div class="row">
                                    <div class="col-1 text-center"></div>
                                    <div class="col-10 text-center">Take care to copy the seed in order to correctly reinitialize the wallet </div>
                                    <div class="col-1 text-center"></div>
                                </div>
                            </div>
                            <div class="container-export-seed">
                                <div class="row">
                                    <div class="col-1"></div>
                                    <div class="col-10 text-center">
                                        <div class="container-seed-to-export">{this.state.seed}</div>
                                    </div>
                                    
                                </div>  
                            </div>
                            <div class="container-export-seed-button">
                                <div class="row">
                                    <div class="col-12 text-center">
                                        <button class="btn btn-copy-seed"><span class="fa fa-clipboard"></span></button>
                                    </div>
                                </div> 
                                <div class="row">
                                    <div class="col-12 text-center">
                                        Copy to clipboard
                                    </div>
                                </div>   
                            </div>
                            
                        </div>
                    : '' }
                    
                    <div class="container-menu-init">
                        <div class="row">
                            <div class="col-6 text-center padding-0">
                                <button disabled={this.state.initialization[0] ? true : false} onClick={this.goBack} type="submit" class="btn btn-menu-init-back"><span class="fa fa-arrow-left"></span></button>
                            </div>
                            <div class="col-6 text-center padding-0">
                                <button disabled={this.state.initialization[0] ? (this.state.name.length > 0 ? false : true ) : 
                                                  this.state.initialization[1] ? (this.state.randomLetters === 0 ? false : true) : ''}
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

export default Add;
