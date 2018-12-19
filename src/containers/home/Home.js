import React , { Component } from 'react';
import {getAccountData,promoteTransaction,replayBundle,getLatestInclusion,getBalance} from '../../core/core';
import {startSession} from '../../utils/utils';
import {setCurrentAddress,setCurrentAccount,getCurrentAccount,generateSeed,updateDataAccount,addAccount,getKey,getCurrentNewtwork} from '../../wallet/wallet'
import Transactions from '../transactions/Transactions';
import history from '../../components/history';
import {aes256decrypt,aes256encrypt} from '../../utils/crypto';
import Send from '../send/Send';
import Receive from '../receive/Receive';
import Settings from '../settings/Settings';
import Details from '../details/Details';

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
      this.onGoDetails = this.onGoDetails.bind(this);    

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
      this.setState({network : network});

      let account = await getCurrentAccount(network);
      if (!account) //se non esiste un account x questa net
        account = await this.createAccount(network);
      
      //store the encrypted seed
      const key = await getKey();
      const dseed = aes256decrypt(account.seed,key);
      this.setState({decryptedSeed : dseed});
      
      setCurrentAddress(account.data.latestAddress,this.state.network);
      this.setState({account : account});

      if ( this.state.showHome )
        this.transactions.current.updateData();
    }


    async createAccount (network) {
      //generate new seed
      const newSeed = generateSeed();
      const key = await getKey();
      const eseed = aes256encrypt(newSeed,key);
      
      //get all account data
      let data = await getAccountData(newSeed);
      let account = {
          name : 'name',
          seed : eseed,
          data : data,
          network : network //NUOVA NETWORK
      }
      await addAccount (account);
      return account;
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
      console.log("switch to");
      console.log(account);
      
      //switch account
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
      this.setState({showHome : true});
    }

    onClickMap(){
      history.push('/interact')
    }
    onCloseSettings(){
      this.setState({showSettings:false});
    }
    onClickSettings(){
      this.setState({showSettings:true});
    }
    onGoDetails(transfer){
      this.setState({details:transfer});
      this.setState({showDetails:true});
    }


    render() {
      return (
        <div>
          { this.state.showHome ? (
            <div class="container settings">
              <div class="row">
                <div class="col-2">
                  <button onClick={this.onClickSettings} class="btn btn-settings"><i class="fa fa-bars"></i></button>
                </div>
                <div class="col-8"></div>
                <div class="col-2">
                <button onClick={this.onClickMap} class="btn btn-marker"><i class="fa fa-map-marker"></i></button> 
                </div>
              </div>
            </div>
          ) : ''}
          { !(Object.keys(this.state.account).length === 0 && this.state.account.constructor === Object) ? (
            <div>
              { this.state.showSettings ? ( <Settings switchAccount={this.onSwitchAccount} currentNetwork={this.state.network} currentAccount={this.state.account} close={this.onCloseSettings}/> ) : ''}
              { this.state.showSend ?     ( <Send account={this.state.account} network={this.state.network} onBack={this.onBack} /> ) : ''}
              { this.state.showReceive ?  ( <Receive  account={this.state.account} network={this.state.network} onBack={this.onBack}/> ) : '' }
              { this.state.showDetails ?  ( <Details  details={this.state.details} onBack={this.onBack}/> ) : '' }
              { this.state.showHome ? (
                <div>
                  <div class="container info">
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
                      <div class="col-6 align-center">
                        <button onClick={this.onClickSend} type="button" class="btn btn-primary btn-send">send</button>
                      </div>
                      <div class="col-6 align-center">
                        <button onClick={this.onClickReceive} type="button" class="btn btn-primary btn-receive">receive</button>
                      </div>
                    </div> 
                </div>
                <div class="transactions">
                  <Transactions ref={this.transactions} goDetails={this.onGoDetails} transfers={this.state.account.data.transfers}/>
                </div>
              </div>
              ) : '' }
              
          </div> ) : (
            'loading....' 
          )}
          
        </div>

        
      );
    }
  }

export default Home;