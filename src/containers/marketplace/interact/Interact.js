import React , { Component } from 'react';
import Map from '../../../components/map/Map'

import AddDevice from '../addDevice/AddDevice';
import Alert from '../../../components/alert/Alert';

import {init,fetch,send} from'../../../pp/pp';

import './Interact.css'

//const Mam = require('../../../mam/lib/mam.client');

const { asciiToTrytes, trytesToAscii } = require('@iota/converter')


class Interact extends Component {

    constructor(props, context) {
      super(props, context);

      this.fetchPublicChannel = this.fetchPublicChannel.bind(this);
      this.onAddDevice = this.onAddDevice.bind(this);
      this.addDevice = this.addDevice.bind(this);
      this.onCloseAddDevice = this.onCloseAddDevice.bind(this);
      this.onBuy = this.onBuy.bind(this);
      this.onCloseAlert = this.onCloseAlert.bind(this);

      this.state = {
        interval : null,
        devices : [],
        showAddDevice : false,
        showAlert : false,
        alertText : '',
        alertType : '',
        ppChannel : '',
      }
    }

    async componentDidMount(){
      const seed = 'FADAAVHBCVRI9IRWXLTDBJMREFIUBCDMMOKHLWAENHKQVXRGIMGFVJI9ZZRCRFWFOOBUHJOCEZMILTQHI';
      const publicState = await init('https://nodes.devnet.iota.org:443',seed);
      
      this.setState({ppChannel:'MFGFYCNAPQUMXTTWRMVUZQCTGRVKTEOCVHOMJJBDZNKPWF9JGBQXFWMMZLEOW9EZNBOQSRVVLYZRHRXEA'});
      await this.fetchPublicChannel(); 
      await this.fetchPublicChannel(); 
      await this.fetchPublicChannel(); 
      await this.fetchPublicChannel(); 
      //setInterval(this.fetchPublicChannel,30000);
    }

    //UAYHORUZYANPN9OMVDHZRPQVWNYAGVJNGCVMFQLTQOJWIKGVEBUVNKZNWQXX9EZGBXDOLUPGBCRHU9WUE
    async fetchPublicChannel(){
      
      console.log("fetching on " + this.state.ppChannel);
      const res = await fetch(this.state.ppChannel);
      this.setState({ppChannel:res.channel});
      console.log(res);
      console.log("new fetching on " + res.channel);
      return res;
    }



    async addDevice(){
      this.setState({showAddDevice : true});
    }
    async onCloseAddDevice(){
      this.setState({showAddDevice : false});
    }

    async onAddDevice(device){

      /*this.setState({showAddDevice : false});

      this.setState({alertText : 'Fetching MAM channel...'});
      this.setState({alertType : 'loading'});
      this.setState({showAlert : true});

      
      try{
        //if receive a data it means that device is connected therefore i can save it on the db
        
        //if correct mam message
        if ( resp['nextRoot'] && resp['messages'] ){
          addDevice(device , () => {
            this.setState({alertText : 'Device succesfully added!!'});
            this.setState({alertType : 'success'});

            //load the new device
            getAllDevices( devices => {
              this.setState({devices : devices});
            })
          });
        }
        
      }catch(err){
        console.log(err);
        this.setState({alertText : 'Impossible to add the device'});
        this.setState({alertType : 'error'});
      }*/
    }

    onBuy(device){
      console.log("buy");
      console.log(device);
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

            { this.state.showAddDevice ? 
              <AddDevice onAddDevice={this.onAddDevice}
                         onClose={this.onCloseAddDevice}/>
            : ''}

          </div> 
          {this.state.showAlert ?  <Alert text={this.state.alertText} type={this.state.alertType} onClose={this.onCloseAlert}/> : ''}
        </div>
        
      );
    }
  }

export default Interact;