import React , { Component } from 'react';
import Map from '../../components/map/Map'

import './Interact.css'

class Interact extends Component {

    constructor(props, context) {
      super(props, context);

      this.state = {

      }
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