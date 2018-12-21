import React , { Component } from 'react';
import Map from '../../components/map/Map'
import history from '../../components/history'

import './Interact.css'

class Interact extends Component {

    constructor(props, context) {
      super(props, context);

      this.goBack = this.goBack.bind();
    }

    goBack(){
      history.push('home');
    }

    render() {
      return (
        <div>
          <div class="container-settings">
            <div class="row text-center">
              <div class="col-2">
                <button onClick={this.goBack} class="btn btn-back"><i class="fa fa-arrow-left"></i></button>
              </div>
              <div class="col-8"></div>
              <div class="col-2"></div>
            </div>
          </div>
          <Map/>
        </div> 
      );
    }
  }

export default Interact;