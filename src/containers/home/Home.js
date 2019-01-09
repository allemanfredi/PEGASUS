import React , { Component } from 'react';
import {getAccountData} from '../../core/core';
import {setCurrentAddress,setCurrentAccount,getCurrentAccount,generateSeed,updateDataAccount,addAccount,getKey,getCurrentNewtwork,updateNameAccount,deleteAccount} from '../../wallet/wallet'
import {aes256decrypt,aes256encrypt,sha256} from '../../utils/crypto';


import Send from '../send/Send';
import Receive from '../receive/Receive';
import Settings from '../settings/Settings';
import Details from '../details/Details';
import Transactions from '../transactions/Transactions';
import Add from '../add/Add';
import Edit from '../edit/Edit';
import Interact from '../interact/Interact'

import Loader from '../../components/loader/Loader'
import Navbar from '../../components/navbar/Navbar'


import './Home.css'

class Home extends Component {

    constructor(props, context) {
      super(props, context);

      //transactions components
      this.transactions = React.createRef();

      this.onClickSend = this.onClickSend.bind(this);
      this.onClickSettings = this.onClickSettings.bind(this);
      this.onCloseSettings = this.onCloseSettings.bind(this);
      this.onClickReceive = this.onClickReceive.bind(this);
      this.onBack = this.onBack.bind(this);      
      this.onSwitchAccount = this.onSwitchAccount.bind(this);  
      this.onAddAccount = this.onAddAccount.bind(this);
      this.onGoDetails = this.onGoDetails.bind(this);  
      this.onLogout = this.onLogout.bind(this);  
      this.onShowEdit = this.onShowEdit.bind(this);
      this.onCloseEdit = this.onCloseEdit.bind(this);
      this.onChangeAccount = this.onChangeAccount.bind(this);  
      this.onChangeName = this.onChangeName.bind(this);
      this.onDeleteAccount = this.onDeleteAccount.bind(this);
      this.onClickMap = this.onClickMap.bind(this);
      this.onCloseDetails = this.onCloseDetails.bind(this);
      this.onReload = this.onReload.bind(this);


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
        showInteract : false,
        showDetails : false,
        showAdd : false,
        showEdit : false,
        interval : {},
      };

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
        this.state.interval = setInterval(() => this.getData(), 60000);
        
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
      if ( JSON.stringify(network) !== JSON.stringify(this.state.network) ){
        console.log(network);
        this.setState({account:{}});
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
            id : sha256(name),
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

   async onReload(){
     this.setState({account:{}})
     this.getData();
   }

    async onSwitchAccount(account){

      this.setState({account : account});

      //store the encrypted seed
      const key = await getKey();
      const dseed = aes256decrypt(account.seed,key);
      this.setState({decryptedSeed : dseed});

      await setCurrentAccount(account,this.state.network);
    }

    async onChangeName(newName){
      //change the name of the current account
      await updateNameAccount(this.state.account,newName);
      this.setState(prevState => ({account: {...prevState.account,name: newName}}));
      this.setState({showEdit:false});
    }

    async onDeleteAccount(){
      
      await deleteAccount(this.state.account);
      const newAccount = await getCurrentAccount(this.state.network);
      this.setState({account:newAccount});
      this.setState({showEdit:false});
      this.setState({showSettings:false});
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
      this.setState({showInteract : false});
      this.setState({showHome : true});
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
      this.setState({showHome:true});
      this.setState({showAdd:false});
    }

    onLogout(){
      clearInterval(this.state.interval);
      this.props.onLogout();
    }

    onShowEdit(){
      this.setState({showEdit:true});
    }

    onCloseEdit(){
      this.setState({showEdit:false});
    }

    onClickMap(){
      this.setState({showHome:false});
      this.setState({showSettings:false});
      this.setState({showInteract:true});
    }

    onCloseDetails(){
      this.setState({showDetails:false});
    }




    render() {
      return (
        <div>
          <Navbar showBtnSettings={this.state.showHome} 
                  showBtnMarker={this.state.showHome} 
                  showBtnBack={!this.state.showHome} 
                  text={this.state.showHome ? this.state.account.name : (this.state.showSend ? 'Send' : (this.state.showReceive ? 'Receive' : this.state.showAdd ? 'Add account' : (this.state.showInteract ? 'Buy data' : '')))}
                  onClickSettings={this.onClickSettings}
                  onClickMap={this.onClickMap}
                  onBack={this.onBack}>
          </Navbar>
          
          { !(Object.keys(this.state.account).length === 0 && this.state.account.constructor === Object)  ? ( //!
            <div>
              { this.state.showSettings ? ( <Settings currentNetwork={this.state.network} 
                                                      currentAccount={this.state.account} 
                                                      onAddAccount={this.onAddAccount} 
                                                      onSwitchAccount={this.onSwitchAccount}
                                                      onShowMap={this.onClickMap}
                                                      onShowEdit={this.onShowEdit}
                                                      onLogout={this.onLogout}
                                                      onClose={this.onCloseSettings}/> ) 
              : ''}
              { this.state.showSend ?     ( <Send     account={this.state.account} network={this.state.network} /> ) : ''}
              { this.state.showReceive ?  ( <Receive  account={this.state.account} network={this.state.network} /> ) : '' }
              { this.state.showDetails ?  ( <Details  details={this.state.details} 
                                                      onClose={this.onCloseDetails}
                                             /> ) : '' }
              { this.state.showAdd ?      ( <Add      onChangeAccount={this.onChangeAccount}/>) : ''}
              { this.state.showInteract ? ( <Interact />) : ''}

              { this.state.showEdit ?     ( <Edit     account={this.state.account} 
                                                      onClose={this.onCloseEdit}
                                                      onChangeName={this.onChangeName}
                                                      onDeleteAccount={this.onDeleteAccount}/>) : ''}
              { this.state.showHome ? (
                <div>
                  <div class="container-info">
                    <div class="row ">
                      <div class="col align-center">
                        <img src="./material/logo/iota-logo.png" height="60" width="60"/>
                        <div class="container-balance">
                          { this.state.account.data.balance > 99999999 || this.state.account.data.balance < -99999999 ? (this.state.account.data.balance / 1000000000).toFixed(2) + " Gi" : 
                            this.state.account.data.balance > 99999 || this.state.account.data.balance < -99999  ? (this.state.account.data.balance / 1000000).toFixed(2) + " Mi" :
                            this.state.account.data.balance > 999 || this.state.account.data.balance < -999 ?  (this.state.account.data.balance / 1000).toFixed(2) + " Ki"  :  
                            this.state.account.data.balance + "i" }
                        </div>
                      </div>
                    </div>  
                    <div class="row">
                      <div class="col-6 text-center">
                        <button onClick={this.onClickSend} class="btn btn-send"><i class="fa fa-paper-plane icon"></i></button>
                      </div>
                      <div class="col-6 text-center">
                        <button onClick={this.onClickReceive}  class="btn btn-receive"><i class="fa fa-download icon" ></i></button>
                      </div>
                    </div> 
                    <div class="row">
                      <div class="col-6 text-center">Send</div>
                      <div class="col-6 text-center">Receive</div>
                    </div> 
                </div>
                <div class="container-transactions">
                  <Transactions ref={this.transactions} 
                                transfers={this.state.account.data.transfers}
                                onGoDetails={this.onGoDetails} 
                                onReload={this.onReload}
                               />
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