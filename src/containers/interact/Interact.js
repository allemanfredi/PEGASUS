import React , { Component } from 'react';
import Map from '../../components/map/Map'

import './Interact.css'

const Mam = require('../../mam/lib/mam.client');
const { asciiToTrytes, trytesToAscii } = require('@iota/converter')


class Interact extends Component {

    constructor(props, context) {
      super(props, context);

      this.state = {

      }
    }

    async componentDidMount(){
      console.log(Mam);
      const state = Mam.init('https://testnet140.tangle.works')
      const root = 'IWJWPWWTDRHBSGKMIM9TEHBOMTCCMZHOKECZJMYRQJRJZACBGGICIUFFXAPYNDMMOFFPIEREQZISMKVSX';
      const key = 'IREALLYENJOYPOTATORELATEDPRODUCTS';
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