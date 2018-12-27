import React , { Component } from 'react';
import {getAccountData} from '../../core/core';
import {startSession} from '../../utils/utils';
import {setCurrentAddress,setCurrentAccount,getCurrentAccount,generateSeed,updateDataAccount,addAccount,getKey,getCurrentNewtwork} from '../../wallet/wallet'
import {aes256decrypt,aes256encrypt} from '../../utils/crypto';
import history from '../../components/history';

import Send from '../send/Send';
import Receive from '../receive/Receive';
import Settings from '../settings/Settings';
import Details from '../details/Details';
import Transactions from '../transactions/Transactions';
import Add from '../add/Add';

import Loader from '../../components/loader/Loader'
import Navbar from '../../components/navbar/Navbar'


import './Home.css'

class Home extends Component {

    constructor(props, context) {
      super(props, context);

      //transactions components
      this.transactions = React.createRef();

      this.onClickSend = this.onClickSend.bind(this);
      this.onClickMap = this.onClickMap.bind(this);
      this.onClickSettings = this.onClickSettings.bind(this);
      this.onCloseSettings = this.onCloseSettings.bind(this);
      this.onClickReceive = this.onClickReceive.bind(this);
      this.onBack = this.onBack.bind(this);      
      this.onSwitchAccount = this.onSwitchAccount.bind(this);  
      this.onAddAccount = this.onAddAccount.bind(this);
      this.onGoDetails = this.onGoDetails.bind(this);  
      this.onChangeAccount = this.onChangeAccount.bind(this);  

      this.state = {
        error: '',
        account : {},
        network: {},
        details : {}, //transaction selected from the table 
        decryptedSeed : '',
        isLoading : false,
        showSend : false,
        showHome : true,
        showReceive : false,
        showSettings : false,
        showDetails : false,
        showAdd : false,
      };

      startSession();
    }

    async componentDidMount(){
      try{

        const network = await getCurrentNewtwork();
        this.setState({network : network});
        const account = await getCurrentAccount(network);

        const key = await getKey();
        const dseed = aes256decrypt(account.seed,key);
        this.setState({decryptedSeed : dseed});

        //check account data after 50 seconds in order to receive the transaction
        setInterval(() => this.getData(), 20000);

        //reattachment every 30 minute and during the acces
        /*this.reattachBundles(account.data.transactions)
        setInterval(() => this.reattachBundles(account.data.transactions), (60000 * 30));*/
        
        //set the current address in the chrome local storage
        setCurrentAddress(account.data.latestAddress,this.state.network);
        this.setState({account : account});

      }catch(err){
          this.setState({ error: err.error });
          console.log(err);
      }
    }


    async componentWillReceiveProps(nextProps) {
      //controllare se è cambiata la rete (testnet/mainnet);
      const network = await getCurrentNewtwork();
      console.log(network);
      if ( JSON.stringify(network) !== JSON.stringify(this.state.network) ){
        this.setState({network : network});

        let account = await getCurrentAccount(network);
        if (!account){ //se non esiste un account x questa net
          account = await this.createAccount(network,'net-no-name');
        }
        
        //store the encrypted seed
        const key = await getKey();
        const dseed = aes256decrypt(account.seed,key);
        this.setState({decryptedSeed : dseed});
        
        this.setState({account : account});

        if ( this.state.showHome )
          this.transactions.current.updateData();
      }
    }


    async createAccount (network,name) {
      //generate new seed
      return new Promise( async (resolve,reject) => {
        const newSeed = generateSeed();
        const key = await getKey();
        const eseed = aes256encrypt(newSeed,key);
        
        //get all account data
        const data = await getAccountData(newSeed);
        const account = {
            name : name ,
            seed : eseed,
            data : data,
            network : network //NUOVA NETWORK
        }
        await addAccount (account);
        resolve(account);
      })
    }

    async getData(){
      const data = await getAccountData(this.state.decryptedSeed);
      
      //update table
      const newAccount = await updateDataAccount(data,this.state.network);         
      this.setState({account : newAccount});
      if ( this.state.showHome && !this.state.showSettings )
        this.transactions.current.updateData();
    }


    async onSwitchAccount(account){
      this.setState({showSettings : false});
      this.setState({account : account});
      await setCurrentAccount(account,this.state.network);
    }

    onClickSend(){
      this.setState({showSend : true});
      this.setState({showHome : false});
    }
    onClickReceive(){
      this.setState({showReceive : true});
      this.setState({showHome : false});
    }
    onBack(){
      this.setState({showSend : false});
      this.setState({showReceive : false});
      this.setState({showDetails : false});
      this.setState({showAdd : false});
      this.setState({showHome : true});
    }
    onClickMap(){
      history.push('/interact')
    }
    onClickSettings(){
      this.setState({showSettings:true});
    }
    onCloseSettings(){
      this.setState({showSettings:false});
    }
    onGoDetails(transfer){
      this.setState({details:transfer});
      this.setState({showDetails:true});
    }
    onAddAccount(){
      this.setState({showAdd:true});
      this.setState({showHome : false});
      this.setState({showSettings : false});
    }
    onChangeAccount(account){
      this.setState({account:account});
    }


    render() {
      return (
        <div>
          <Navbar showBtnSettings={this.state.showHome} 
                  showBtnMarker={this.state.showHome} 
                  showBtnBack={!this.state.showHome} 
                  onClickSettings={this.onClickSettings}
                  onBack={this.onBack}>
          </Navbar>
          
          { !(Object.keys(this.state.account).length === 0 && this.state.account.constructor === Object) ? ( //!
            <div>
              { this.state.showSettings ? ( <Settings currentNetwork={this.state.network} 
                                                      currentAccount={this.state.account} 
                                                      onAddAccount={this.onAddAccount} 
                                                      onSwitchAccount={this.onSwitchAccount}
                                                      onClose={this.onCloseSettings}/> ) 
              : ''}
              { this.state.showSend ?     ( <Send     account={this.state.account} network={this.state.network} /> ) : ''}
              { this.state.showReceive ?  ( <Receive  account={this.state.account} network={this.state.network} /> ) : '' }
              { this.state.showDetails ?  ( <Details  details={this.state.details} /> ) : '' }
              { this.state.showAdd ?      ( <Add      onChangeAccount={this.onChangeAccount}></Add>) : ''}
              { this.state.showHome ? (
                <div>
                  <div class="container-info">
                    <div class="row ">
                      <div class="col align-center">
                        <div>
                          img
                        </div>
                        <h1>dollari</h1>
                        <h2>{this.state.account.data.balance} IOTA</h2>
                      </div>
                    </div>  
                    <div class="row">
                      <div class="col-6 text-center">
                        <button onClick={this.onClickSend} class="btn btn-send"><i class="fa fa-upload icon"></i></button>
                      </div>
                      <div class="col-6 text-center">
                        <button onClick={this.onClickReceive}  class="btn btn-receive"><i class="fa fa-download icon" ></i></button>
                      </div>
                    </div> 
                </div>
                <div class="container-transactions">
                  <Transactions ref={this.transactions} goDetails={this.onGoDetails} transfers={this.state.account.data.transfers}/>
                </div>
              </div>
              ) : '' }
              
          </div> ) : (
             <Loader/>
          )}
        </div>
      );
    }
  }

export default Home;