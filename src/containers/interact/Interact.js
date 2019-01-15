import React , { Component } from 'react';
import Map from '../../components/map/Map'

import './Interact.css'

const Mam = require('../../mam/lib/mam.client');
const { asciiToTrytes, trytesToAscii } = require('@iota/converter')


class Interact extends Component {

    constructor(props, context) {
      super(props, context);

      this.getDevices = this.getDevices.bind();

      this.state = {
        inteval : null
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
        console.log(JSON.parse(trytesToAscii(data)))
      })
    }

    render() {
      return (
        <div class="container-map">
          <Map/>
        </div> 
      );
    }
  }

export default Interact;