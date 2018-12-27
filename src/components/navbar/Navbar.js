import React, {Component} from 'react';

import './Navbar.css'

export default class Navbar extends Component {

  constructor(props) {
    super(props);

    this.back = this.back.bind(this);
    this.clickSettings = this.clickSettings.bind(this);

    this.state = {
    };
  }

  back(){
    this.props.onBack(); 
  }
  clickSettings(){
      this.props.onClickSettings();
  }

  render() {
    return (
        <div class="container-bar">
            <div class="row text-center">
            { this.props.showBtnSettings ? 
                <div class="col-2">
                    <button onClick={this.clickSettings} class="btn btn-settings"><i class="fa fa-bars"></i></button>
                </div>
            : ''}
            { this.props.showBtnBack ? 
                <div class="col-2">
                    <button onClick={this.back} class="btn btn-back"><i class="fa fa-arrow-left"></i></button>
                </div>
            : ''}
                <div class="col-8 text-center">
                    <div class="account-name">{this.props.text}</div>
                </div>
            { this.props.showBtnMarker ? 
                <div class="col-2">
                    <button onClick={this.onClickMap} class="btn btn-marker"><i class="fa fa-map-marker"></i></button> 
                </div>
            : ''}
            </div>
        </div>
      );
    }
}


