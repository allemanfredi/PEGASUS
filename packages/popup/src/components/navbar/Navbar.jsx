import React, { Component } from 'react';


export default class Navbar extends Component {
    constructor(props) {
        super(props);

        this.state = {
        };
    }

    render() {
        return (
            <div className='bg-darkblue'>
                <div className='row text-center '>
                    { this.props.showBtnSettings ?
                        <div className='col-2'>
                            <button onClick={() => this.props.onClickSettings()} className='btn btn-icon'><i className='fa fa-bars'></i></button>
                        </div>
                        : ''}
                    { this.props.showBtnBack ?
                        <div className='col-2'>
                            <button onClick={() => this.props.onBack()} className='btn btn-icon'><i className='fa fa-arrow-left'></i></button>
                        </div>
                        : ''}
                    <div className='col-8 text-center my-auto'>
                        <div className='text-white text-sm'>{this.props.text}</div>
                    </div>
                    
                    { this.props.showBtnEllipse ? 
                        <div className='col-2'>
                            <button onClick={() => this.props.onAccountDetails()} className='btn btn-icon'><i className='fa fa-ellipsis-h'></i></button>
                        </div>
                    : ''}
                        
                </div>
            </div>
        );
    }
}

