import React , { Component } from 'react';
import Map from '../../components/map/Map'

import {mamInit} from '../../mam/mam'

import './Interact.css'

class Interact extends Component {

    constructor(props, context) {
      super(props, context);

      this.state = {

      }
    }

    async componentDidMount(){
      await mamInit(this.props.network.provider);
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