import React, { Component } from 'react';


export default class Navbar extends Component {
    constructor(props) {
        super(props);

        this.deleteAccount = this.deleteAccount.bind(this);

        this.state = {
            showEllipseMenu : false
        };
    }
    
    deleteAccount(){
        this.setState({showEllipseMenu:false});
        this.props.onDeleteAccount()
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
                            <button onClick={() => this.setState({showEllipseMenu:!this.state.showEllipseMenu})} className='btn btn-icon'><i className='fa fa-ellipsis-h'></i></button>
                        </div>

                    : ''} 
                </div>

                { this.state.showEllipseMenu ?
                    <div className="container-ellipse-menu container">
                        <div className="row mt-1 cursor-pointer" onClick={this.deleteAccount}>
                            <div className="col-2 text-white text-center text-xs"><span className='fa fa-trash-o'></span></div>
                            <div className="col-10 text-white text-xs">Delete account</div>
                        </div>

                        <div className="row mt-1 cursor-pointer" onClick={() => this.props.onViewAccountOnExplorer()}>
                            <div className="col-2 text-white text-center text-xs"><span className='fa fa-wpexplorer'></span></div>
                            <div className="col-10 text-white text-xs">View on explorer</div>
                        </div>

                        <div className="row mt-1 cursor-pointer" onClick={() => this.props.onExportSeed()}>
                            <div className="col-2 text-white text-center text-xs"><span className='fa fa-share'></span></div>
                            <div className="col-10 text-white text-xs">Export seed</div>
                        </div>
                    </div>
                    : '' }
                    
            </div>
        );
    }
}

