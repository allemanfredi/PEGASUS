import React , { Component } from 'react';
import {aes256encrypt,sha256,generateKeys} from '../../utils/crypto'
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
      this.copyToClipboard = this.copyToClipboard.bind(this);

      this.labelSeed = React.createRef();

      this.state = {
        name : '',
        seed : [],
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
            const letter = generateSeed(1)[0];
            let seed = state.seed;
            seed[index] = letter;
            return {
                seed
            }
        })
    }

    copyToClipboard(e) {
        this.labelSeed.current.select();
        document.execCommand('copy');
        e.target.focus();
        this.setState({isCopiedToClipboard : true});
    };

    async addAccount() {
        return new Promise ( async (resolve,reject) => {
            try{
                const seed = this.state.seed.toString().replace(/,/g, '');

                const key = await getKey()
                const eseed = aes256encrypt(seed,key);

        
                //get all account data
                const data = await getAccountData(seed);
                const account = {
                    name : this.state.name,
                    seed : eseed,
                    data : data,
                    id : sha256(this.state.name),
                    network : this.props.network,
                    marketplace : {'keys' : generateKeys() , 'channels':[]}
                }
                await addAccount(account,this.props.network,true); 
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
                            <div className="container-name-text">
                                <div className="row">
                                    <div className="col-12 text-center">Let's add a name</div>
                                </div>
                            </div>
                            <div className="container-name-init">
                                <div className="row">
                                    <div className="col-1"></div>
                                    <div className="col-10">
                                        <label for="inp-name" className="inp">
                                            <input value={this.state.name} onChange={e => {this.setState({name: e.target.value})}} type="text" id="inp-name" placeholder="&nbsp;"/>
                                            <span className="label">name</span>
                                            <span className="border"></span>
                                        </label>
                                    </div>
                                    <div className="col-1"></div>
                                </div>
                            </div>
                        </div>
                        

                   : ''}


                   {this.state.initialization[1]  ? 
                        <div>
                            <div className="container-seed-text">
                                <div className="row">
                                    <div className="col-12 text-center">Let's generate a seed</div>
                                </div>
                            </div>
                            { this.state.randomLetters > 0 ?
                                <div className="container-randomise">
                                    <div className="row">
                                        <div className="col-12 text-center">
                                            Press <i className="remained-letters">{this.state.randomLetters}</i> more letters to randomise them
                                        </div>
                                    </div>
                                </div>
                            : ''}
                            <div className="container-seed-init">
                                {[0,9,18,27,36,45,54,63,72].map(item => {
                                    return (
                                        <div className="row">
                                            <div className="col-1"></div>
                                            { Array.from(new Array(9), (x,i) => i+item).map( index => {
                                                return (
                                                    <div className="col-1">
                                                        <div onClick={ () => this.randomiseSeedLetter(index) } className="container-letter">{this.state.seed[index]}</div>
                                                    </div>
                                                )
                                            })}
                                            <div className="col-1"></div>
                                        </div>
                                    )
                                })}
                            </div>  
                        </div>
                    : ''}

                    {this.state.initialization[2]  ?
                        <div>
                            <div className="container-export-text">
                                <div className="row">
                                    <div className="col-12 text-center">Let's export the seed</div>
                                </div>
                            </div>
                            <div className="container-export-suggestion">
                                <div className="row">
                                    <div className="col-1 text-center"></div>
                                    <div className="col-10 text-center">Take care to copy the seed in order to correctly reinitialize the wallet </div>
                                    <div className="col-1 text-center"></div>
                                </div>
                            </div>
                            <div className="container-export-seed">
                                <div className="row">
                                    <div className="col-1"></div>
                                    <div className="col-10 text-center">
                                        <input className="input-seed-to-export" ref={this.labelSeed} value={this.state.seed.toString().replace(/,/g,'')} readOnly/>
                                    </div>
                                    
                                </div>  
                            </div>
                            <div className="container-export-seed-button">
                                <div className="row">
                                    <div className="col-12 text-center">
                                        <button onClick={this.copyToClipboard} className="btn btn-copy-seed"><span className="fa fa-clipboard"></span></button>
                                    </div>
                                </div> 
                                <div className="row">
                                    <div className="col-12 text-center">
                                        <div className ="container-copy-to-clipboard">
                                             {this.state.isCopiedToClipboard ? 'Copied!' : 'Copy to clipboard'}
                                        </div>
                                    </div>
                                </div>   
                            </div>
                            
                        </div>
                    : '' }
                    
                    <div className="container-menu-init">
                        <div className="row">
                            <div className="col-6 text-center padding-0">
                                <button disabled={this.state.initialization[0] ? true : false} onClick={this.goBack} type="submit" className="btn btn-menu-init-back"><span className="fa fa-arrow-left"></span></button>
                            </div>
                            <div className="col-6 text-center padding-0">
                                <button disabled={this.state.initialization[0] ? (this.state.name.length > 0 ? false : true ) : 
                                                  this.state.initialization[1] ? (this.state.randomLetters === 0 ? false : true) : ''}
                                        onClick={this.goOn}
                                        type="submit" 
                                        className="btn btn-menu-init-option"><span className="fa fa-arrow-right"></span></button>
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
