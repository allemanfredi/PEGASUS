import React , { Component } from 'react';
import Map from '../../components/map/Map'

import AddDevice from '../addDevice/AddDevice';

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
        showAddDevice : false
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
      const state = Mam.init('https://testnet140.tangle.works')
      const root = 'USUOOSHDC9DRIKNEKCKSUKKDCPBBAAXKPYXWOEGSCBNKTKYD9EDW9ZTZAF9YWEUUPEPCBSANBKUFDZYJN';
      const resp = await Mam.fetch(root, 'public', null, data => {
        const d = JSON.parse(trytesToAscii(data));
        console.log(d);
      })
    }

    async addDevice(){
      this.setState({showAddDevice : true});
    }

    async onAddDevice(device){
      console.log(device);
    }

    async onCloseAddDevice(){
      this.setState({showAddDevice : false});
    }


    render() {
      return (
        <div class="container-map">
          <Map devices={this.state.devices}/>

          { this.state.showAddDevice ? 
            <AddDevice onAddDevice={this.onAddDevice}
                       onClose={this.onCloseAddDevice}/>
          : ''}

        </div> 
      );
    }
  }

export default Interact;