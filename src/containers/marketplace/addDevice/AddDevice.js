import React, { Component } from 'react';

import './AddDevice.css';

class AddDevice extends Component {

    constructor(props,context) {
        super(props,context);
        
        this.onCloseAlert = this.onCloseAlert.bind(this);
        this.AddDevice = this.AddDevice.bind(this);

        this.state = {
            name : '',
            root : 'CSYUAMZYTYUXYWTMRWJQGFIPGNDNEFIBMYSMEM9ZLVHHUENKVKJTR9DNFJVNUWJHGHHPCKKRZDAJPHVVT',
            address  : '',
            lat : '',
            long : '',
            price : null,
        }

    }

    async AddDevice(){
        const device = {
            'name' : this.state.name,
            'root' : this.state.root,
            'address':this.state.address,
            'lat' : this.state.lat,
            'long' : this.state.long,
        }
        this.props.onAddDevice(device);
    }

    onCloseAlert(){
        this.setState({showAlert:false});
        this.setState({alerText:''});
        this.setState({alertType:''});
    }
    
    render() {
        return (
            <div class="modal">
                <div class="container-add-device">
                    <div class="row">
                        <div class="col-2 text-center">
                            <button onClick={() => {this.props.onClose()}} type="button" class="close btn-close-add-device" aria-label="Close">
                                <span aria-hidden="true">&times;</span>
                            </button>
                        </div>
                        <div class="col-10 text-center"></div>
                    </div>
                    <div class="row">
                        <div class="col-1"></div>
                        <div class="col-10">
                            <label for="inp-name" class="inp">
                                <input value={this.state.name} onChange={e => {this.setState({name:e.target.value})}} type="text" id="inp-name" placeholder="&nbsp;"/>
                                <span class="label">name</span>
                                <span class="border"></span>
                            </label>
                        </div>
                        <div class="col-1"></div>
                    </div>
                    <div class="row">
                        <div class="col-1"></div>
                        <div class="col-10">
                            <label for="inp-root" class="inp">
                                <input value={this.state.root} onChange={e => {this.setState({root:e.target.value})}} type="text" id="inp-root" placeholder="&nbsp;"/>
                                <span class="label">root</span>
                                <span class="border"></span>
                            </label>
                        </div>
                        <div class="col-1"></div>
                    </div>
                    <div class="row">
                        <div class="col-1"></div>
                        <div class="col-10">
                            <label for="inp-address" class="inp">
                                <input value={this.state.address} onChange={e => {this.setState({address:e.target.value})}} type="text" id="inp-address" placeholder="&nbsp;"/>
                                <span class="label">address</span>
                                <span class="border"></span>
                            </label>
                        </div>
                        <div class="col-1"></div>
                    </div>
                    <div class="row">
                        <div class="col-1"></div>
                        <div class="col-10">
                            <label for="inp-price" class="inp">
                                <input value={this.state.price} onChange={e => {this.setState({price:e.target.value})}} type="number" id="inp-price" placeholder="&nbsp;"/>
                                <span class="label">price</span>
                                <span class="border"></span>
                            </label>
                        </div>
                        <div class="col-1"></div>
                    </div>
                    <div class="row">
                        <div class="col-1"></div>
                        <div class="col-5 text-center">
                            <label for="inp-lat" class="inp">
                                <input value={this.state.lat} onChange={e => {this.setState({lat:e.target.value})}} type="number" id="inp-lat" placeholder="&nbsp;"/>
                                <span class="label">lat</span>
                                <span class="border"></span>
                            </label>
                        </div>
                        <div class="col-5 text-center">
                            <label for="inp-long" class="inp">
                                <input value={this.state.long} onChange={e => {this.setState({long:e.target.value})}} type="number" id="inp-long" placeholder="&nbsp;"/>
                                <span class="label">long</span>
                                <span class="border"></span>
                            </label>
                        </div>
                        <div class="col-1"></div>
                    </div>
                    <div class="row">
                        <div class="col-1"></div>
                        <div class="col-10 text-center">
                            <button onClick={this.AddDevice}  
                                    disabled={this.state.name.length === 0 ? true :
                                              this.state.root.length === 0 ? true :
                                              this.state.address.length === 0 ? true :
                                              this.state.lat.length === 0 ? true : 
                                              this.state.long.length === 0 ? true : false} 
                                    class="btn btn-add-device">Add device <span class="fa fa-plus"></span></button>
                        </div>
                        <div class="col-1"></div>
                    </div>
                    <div class="row">
                        <div class="col-1"></div>
                        <div class="col-10 text-center">
                            <div class="container-suggestion-add-device">
                                Please pay attention that your device is'attacching messages on MAM channel
                            </div>
                        </div>
                        <div class="col-1"></div>
                    </div>
                </div>
            </div>
        );
    }
}

export default AddDevice;
    