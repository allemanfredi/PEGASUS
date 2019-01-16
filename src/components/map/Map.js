import React, {Component} from 'react';
import MapGL, {NavigationControl,Marker,Popup} from 'react-map-gl';

import Pin from './pin/Pin';


const TOKEN = 'pk.eyJ1IjoiYWxsZW1hbmZyZWRpIiwiYSI6ImNqbmx3aXhiZjAwc2IzcG16OWhmNWpxaWEifQ.uH79I15NLlm4yLZ5kDAojg'; // Set your mapbox token here

const navStyle = {
  position: 'absolute',
  top: 0,
  left: 0,
};
export default class Map extends Component {

  constructor(props) {
    super(props);

    this.state = {
      viewport: {
        latitude: 45.4,
        longitude: 9.1,
        zoom: 2.8,
        bearing: 0,
        pitch: 0,
        width: 500,
        height: 500,
      },
      popupInfo: null
    };
  }

  updateViewport = (viewport) => {
    this.setState({viewport});
  }

  renderMarker = (device) => {
    return (
      <Marker 
        key={device.name}
        longitude={device.longitude}
        latitude={device.latitude} 
        pinColor='#00008b'
        >
        <Pin size={20} onClick={() => this.setState({popupInfo: device})} />
      </Marker>
    );
  }

  renderPopup() {
    const {popupInfo} = this.state;

    return popupInfo && (
      <Popup tipSize={5}
        anchor="top"
        longitude={popupInfo.longitude}
        latitude={popupInfo.latitude}
        onClose={() => this.setState({popupInfo: null})} >
        <div class="container-popup">
          <div class="row">
            <div class="col-12 text-center">
              {'Sensor name'}
            </div>
          </div>
          <div class="row">
            <div class="col-6 text-center">
              <button class="btn">Buy stream <i class="fa fa-check" ></i></button>
            </div>
            <div class="col-6 text-center">
              <button class="btn">Close <i class="fa fa-times" ></i></button>
            </div>
          </div>
        </div>
      </Popup>
    );
  }

  render() {
    const {viewport} = this.state;

    return (
        <MapGL
          {...viewport}
          onViewportChange={this.updateViewport}
          mapStyle="mapbox://styles/mapbox/dark-v9"
          mapboxApiAccessToken={TOKEN}>
         
          { this.props.devices.map (device => {this.renderMarker(device)})}

          {this.renderPopup()}

          <div className="nav" style={navStyle}>
            <NavigationControl onViewportChange={this.updateViewport}/>
          </div>
        </MapGL>
      );
    }
}
