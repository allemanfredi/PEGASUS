import React, { Component } from 'react';

import './Navbar.css';

export default class Navbar extends Component {
    constructor(props) {
        super(props);

        this.state = {
        };
    }

    render() {
        return (
            <div className='container-bar'>
                <div className='row text-center'>
                    { this.props.showBtnSettings ?
                        <div className='col-2'>
                            <button onClick={() => this.props.onClickSettings()} className='btn btn-settings'><i className='fa fa-bars'></i></button>
                        </div>
                        : ''}
                    { this.props.showBtnBack ?
                        <div className='col-2'>
                            <button onClick={() => this.props.onBack()} className='btn btn-back'><i className='fa fa-arrow-left'></i></button>
                        </div>
                        : ''}
                    <div className='col-8 text-center'>
                        <div className='account-name'>{this.props.text}</div>
                    </div>
                    { this.props.showBtnMarker ?
                        <div className='col-2'>
                            <button onClick={() => this.props.onClickMap()} className='btn btn-marker'><i className='fa fa-map-marker'></i></button>
                        </div>
                        : ''}

                    { this.props.showBtnData ?
                        <div className='col-2'>
                            <button onClick={() => this.props.onClickShowData()} className='btn btn-add'><i className='fa fa-database'></i></button>
                        </div>
                        : ''}
                </div>
            </div>
        );
    }
}

