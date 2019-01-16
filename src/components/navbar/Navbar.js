import React, {Component} from 'react';

import './Navbar.css'

export default class Navbar extends Component {

  constructor(props) {
    super(props);

    this.state = {
    };
  }


  render() {
    return (
        <div class="container-bar">
            <div class="row text-center">
            { this.props.showBtnSettings ? 
                <div class="col-2">
                    <button onClick={() => this.props.onClickSettings()} class="btn btn-settings"><i class="fa fa-bars"></i></button>
                </div>
            : ''}
            { this.props.showBtnBack ? 
                <div class="col-2">
                    <button onClick={() => this.props.onBack()} class="btn btn-back"><i class="fa fa-arrow-left"></i></button>
                </div>
            : ''}
                <div class="col-8 text-center">
                    <div class="account-name">{this.props.text}</div>
                </div>
            { this.props.showBtnMarker ? 
                <div class="col-2">
                    <button onClick={() => this.props.onClickMap()} class="btn btn-marker"><i class="fa fa-map-marker"></i></button> 
                </div>
            : ''}

            { this.props.showBtnAdd ? 
                <div class="col-2">
                    <button onClick={() => this.props.onClickAddDevice()} class="btn btn-add"><i class="fa fa-plus"></i></button> 
                </div>
            : ''}
            </div>
        </div>
      );
    }
}


