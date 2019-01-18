import React , { Component } from 'react';
import Map from '../../../components/map/Map'

import AddDevice from '../addDevice/AddDevice';
import Alert from '../../../components/alert/Alert';

import {getAllDevices , addDevice} from '../../../service/service'

import './Interact.css'

const Mam = require('../../../mam/lib/mam.client');
const { asciiToTrytes, trytesToAscii } = require('@iota/converter')


class Interact extends Component {

    constructor(props, context) {
      super(props, context);

      this.getDevices = this.getDevices.bind(this);
      this.onAddDevice = this.onAddDevice.bind(this);
      this.addDevice = this.addDevice.bind(this);
      this.onCloseAddDevice = this.onCloseAddDevice.bind(this);
      this.onBuy = this.onBuy.bind(this);
      this.onCloseAlert = this.onCloseAlert.bind(this);

      this.state = {
        interval : null,
        devices : [],
        showAddDevice : false,
        showAlert : true,
        alertText : '',
        alertType : 'loading'
      }
    }

    async componentDidMount(){
        this.getDevices();    
        this.setState( () => {
          const interval = setInterval(this.getDevices,120000);
          return {interval}
        })
    }

    async getDevices(){
      getAllDevices( devices => {
        this.setState({devices : devices});
      })
    }

    async addDevice(){
      this.setState({showAddDevice : true});
    }

    async onCloseAddDevice(){
      this.setState({showAddDevice : false});
    }

    async onAddDevice(device){

      this.setState({showAddDevice : false});

      this.setState({alertText : 'Fetching MAM channel...'});
      this.setState({alertType : 'loading'});
      this.setState({showAlert : true});

      const state = Mam.init('https://testnet140.tangle.works');
      try{
        const resp = await Mam.fetch(device.root, 'public'); //if receive a data it means that device is connected therefore i can save it on the db
        
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
      }
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