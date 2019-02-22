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
        height: 500
      },
      selectedDevice: null
    };
  }


  updateViewport = (viewport) => {
    this.setState({viewport});
  }

  renderMarker = (device) => {
    return (
      <Marker 
        key={device.name}
        longitude={parseInt(device.lon)}
        latitude={parseInt(device.lat)} 
        >
        <Pin size={20} onClick={() => this.setState({selectedDevice: device})} />
      </Marker>
    );
  }

  renderPopup() {
    const {selectedDevice} = this.state;

    return selectedDevice && (
      <Popup tipSize={5}
        anchor="top"
        longitude={parseInt(selectedDevice.lon)}
        latitude={parseInt(selectedDevice.lat)}
        onClose={() => this.setState({selectedDevice: null})} >
        <div className="container-popup">
          <div className="row">
            <div className="col-12 text-center">
              {selectedDevice.name}
            </div>
          </div>
          <div className="row">
            <div className="col-12 text-center">
              {selectedDevice.description} 
            </div>
          </div>
          <div className="row">
            <div className="col-12 text-center">
              {selectedDevice.price ? selectedDevice.price : 0} i
            </div>
          </div>
          <div className="row">
            <div className="col-6 text-center">
              <button onClick={() => this.props.onBuy(selectedDevice)} className="btn">Buy stream <i className="fa fa-check" ></i></button>
            </div>
            <div className="col-6 text-center">
              <button className="btn">Close <i className="fa fa-times" ></i></button>
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
         
          {this.props.devices.map (device => this.renderMarker(device))}

          {this.renderPopup()}

          <div className="nav" style={navStyle}>
            <NavigationControl onViewportChange={this.updateViewport}/>
          </div>
        </MapGL>
        
      );
    }
}
