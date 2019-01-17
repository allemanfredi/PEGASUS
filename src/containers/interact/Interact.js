import React , { Component } from 'react';
import Map from '../../components/map/Map'

import AddDevice from '../addDevice/AddDevice';
import Alert from '../../components/alert/Alert';

import {getAlltDevices , addDevice} from '../../service/service'

import './Interact.css'

const Mam = require('../../mam/lib/mam.client');
const { asciiToTrytes, trytesToAscii } = require('@iota/converter')


class Interact extends Component {

    constructor(props, context) {
      super(props, context);

      this.getDevices = this.getDevices.bind(this);
      this.onAddDevice = this.onAddDevice.bind(this);
      this.addDevice = this.addDevice.bind(this);
      this.onCloseAddDevice = this.onCloseAddDevice.bind(this);

      this.state = {
        interval : null,
        devices : [],
        showAddDevice : false,
        showAlert : false
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
      const devices = await getAlltDevices();
      console.log(devices);
      //this.setState({devices : devices});
    }

    async addDevice(){
      this.setState({showAddDevice : true});
    }

    async onCloseAddDevice(){
      this.setState({showAddDevice : false});
    }

    async onAddDevice(device){

      this.setState({showAddDevice : false});
      const state = Mam.init('https://testnet140.tangle.works');
      try{
        const resp = await Mam.fetch(device.root, 'public'); //if receive a data it means that device is connected therefore i can save it on the db
        
        if ( resp['nextRoot'] && resp['messages'] ){
          console.log("correct data");
          const res = await addDevice(device);
        }
        
      }catch(err){
        console.log(err);
      }
      
    }


    render() {
      return (
        <div>
          <div class="container-map">
            <Map devices={this.state.devices}/>

            { this.state.showAddDevice ? 
              <AddDevice onAddDevice={this.onAddDevice}
                        onClose={this.onCloseAddDevice}/>
            : ''}

          </div> 
          {this.showAlert ? <Alert/> : ''}
        </div>
        
      );
    }
  }

export default Interact;