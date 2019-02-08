import React , { Component } from 'react';
/*import {init,fetch,send} from'../../../pp/pp';*/
import {fetchDevices,receiveFirstRoot} from'../../../pp/devices';
import {prepareTransfer} from '../../../core/core';
import {getKey} from '../../../wallet/wallet';
import {aes256decrypt} from '../../../utils/crypto';

import Map from '../../../components/map/Map'
import Alert from '../../../components/alert/Alert';

import './Interact.css'

import {init,fetch,publish} from '../../../mam/mam';

class Interact extends Component {

    constructor(props, context) {
      super(props, context);

      //this.fetchPublicChannel = this.fetchPublicChannel.bind(this);
      this.initializeChannels = this.initializeChannels.bind(this);
      this.findDevices = this.findDevices.bind(this);
      this.onBuy = this.onBuy.bind(this);
      this.onCloseAlert = this.onCloseAlert.bind(this);
      this.fetchChannels = this.fetchChannels.bind(this);

      this.state = {
        interval : null,
        devices : [],
        showAlert : false,
        alertText : '',
        alertType : '',
        ppChannel : '',
        channels : [],
        messages : [],
      }
    }

    async componentDidMount(){

      this.setState({alertText:'Fetching devices...'});
      this.setState({alertType:'loading'});
      this.setState({showAlert:true});
      
      //start fetching devices
      await this.findDevices();
      this.setState({showAlert:false});

      //receiving the first root after having payed the device
      await this.initializeChannels();
      //setInterval(() => {this.initializeChannels()}, 30000);

      await this.fetchChannels();
      setInterval(this.fetchChannels,60000);
    }

    appendToMessages = message => {
      
      console.log(message);
      this.setState({ messages: [...this.state.messages, message] });
    }


    async fetchChannels(){
      const app = this.state.channels.slice();
      for ( let channel of app ){
        console.log("call");
        const result = await fetch("https://nodes.devnet.iota.org:443",channel.next_root, 'public', null,this.appendToMessages);
        channel.next_root = result.nextRoot;
        console.log(result.messages);
      }
      this.setState({channels:app});
    }

    //find the device's coordinates
    async findDevices(){
      const devices = await fetchDevices(this.props.network.provider);
      console.log(devices);
      this.setState({devices:devices});
      return;
    }

    //get the first root after having payed the device
    async initializeChannels(){
      const channels = await receiveFirstRoot(this.props.network.provider,this.props.account.data.addresses);
      this.setState({channels:channels});
      console.log(channels);
    }


    async onBuy(device){
      this.setState({alertText:'Paying the device...'});
      this.setState({alertType:'loading'});
      this.setState({showAlert:true});

      //decrypt seed
      const key = await getKey();
      const seed = aes256decrypt(this.props.account.seed,key);

      //message to send
      const message = {
        publicKey : this.props.account.marketplace.keys.public,
        address : this.props.account.data.latestAddress
      }

      const transfer = {
        seed : seed,
        to : device.address,
        value : device.price,
        message : message,
        tag : "",
        difficulty : 9 //for now testnet
      }
      
      prepareTransfer( transfer , (bundle , error) => {
        if ( error ){
          this.setState({alertText:'Payment not successful'});
          this.setState({alertType:'error'});
        }else{
          this.setState({alertText:'payment successful'});
          this.setState({alertType:'success'});
        }
      })
    }

    onCloseAlert(){
      this.setState({showAlert:false});
    }

    render() {
      return (
        <div>
          <div class="container-map">
            <Map devices={this.state.devices}
                 onBuy={this.onBuy}/>



          </div> 
          {this.state.showAlert ?  <Alert text={this.state.alertText} type={this.state.alertType} onClose={this.onCloseAlert}/> : ''}
        </div>
        
      );
    }
  }

export default Interact;