import React , { Component } from 'react';
import {init,fetch,send} from'../../../pp/pp';
import {fetchDevices} from'../../../pp/devices';
import {prepareTransfer} from '../../../core/core';
import {getKey} from '../../../wallet/wallet';
import {aes256decrypt} from '../../../utils/crypto';

import Map from '../../../components/map/Map'
import Alert from '../../../components/alert/Alert';

import './Interact.css'


class Interact extends Component {

    constructor(props, context) {
      super(props, context);

      this.fetchPublicChannel = this.fetchPublicChannel.bind(this);
      this.findDevices = this.findDevices.bind(this);
      this.onBuy = this.onBuy.bind(this);
      this.onCloseAlert = this.onCloseAlert.bind(this);

      this.state = {
        interval : null,
        devices : [],
        showAlert : false,
        alertText : '',
        alertType : '',
        ppChannel : '',
      }
    }

    async componentDidMount(){

      this.setState({alertText:'Fetching devices...'});
      this.setState({alertType:'loading'});
      this.setState({showAlert:true});
      const seed = "999999999999999999999999999999999999999999999999999999999999999999999999999999999"
      await init('https://nodes.devnet.iota.org:443',seed);
      
      

      /*this.setState({ppChannel:'XBDLRKBYFTUTJPBUZJJRQK9WAGMIPFBXWCZSFAQPFCDESVCHCRDOWGFTRNRFEEEAXBHPHXIXBTWTBEYNA'});
      await this.fetchPublicChannel(); 
      await this.fetchPublicChannel(); 
      await this.fetchPublicChannel(); 
      await this.fetchPublicChannel(); */
      //setInterval(this.fetchPublicChannel,30000);

      
      //start fetching devices
      await this.findDevices();
      this.setState({showAlert:false});

      //setInterval(this.findDevices,40000);
    }

    //UAYHORUZYANPN9OMVDHZRPQVWNYAGVJNGCVMFQLTQOJWIKGVEBUVNKZNWQXX9EZGBXDOLUPGBCRHU9WUE
    async fetchPublicChannel(){
      
      console.log("fetching on " + this.state.ppChannel);
      const res = await fetch(this.state.ppChannel);
      console.log(res);
      if ( res.length > 0 ) this.setState({ppChannel:res[res.length-1].data.state.nextChannel});
      
      return res;
    }


    async findDevices(){
      const devices = await fetchDevices(this.props.network.provider);
      console.log(devices);
      this.setState({devices:devices});
      return;
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
        publicKey : this.props.account.marketplace.keys.public
      }

      const transfer = {
        seed : seed,
        to : device.address,
        value : device.price,
        message : message,
        tag : "pegasus",
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