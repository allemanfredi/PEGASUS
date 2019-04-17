import React, { Component } from 'react';
import { getCurrentNewtwork } from '../../wallet/wallet';

import options from '../../options/options';

import './Header.css';

class Header extends Component {
    constructor(props, context) {
        super(props, context);

        this.switchNetwork = this.switchNetwork.bind(this);

        this.state = {
            value: '',
            network: {},
            showNetworks: false
        };
    }

    async componentWillMount() {
        const network = await getCurrentNewtwork();
        this.setState({ network });
    }

    switchNetwork(network) {
        this.setState({ showNetworks: false });
        this.setState({ network });
        this.props.changeNetwork(network);
    }

    render() {
        return (
            <header>
                <div className='row'>
                    <div className='col-2 container-header-logo'>
                        <img src='./material/logo/pegasus-64.png' height='40' width='40' alt='pegasus logo'/>
                    </div>
                    <div className='col-1 col-sm-4'></div>
                    <div className='col-8 col-sm-5'>
                        <div className='row container-selection'>
                            <div className='col-2'> <i className='fa fa-signal'></i></div>
                            <div className='col-8 text-center'>{this.state.network.name}</div>
                            <div className='col-2'>
                                <div onClick={e => { this.setState({ showNetworks: !this.state.showNetworks }); }} className='float-right'>
                                    { this.state.showNetworks ? <span className='fa fa-chevron-up'></span> : <span className='fa fa-chevron-down '></span> }
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className='col-1'></div>
                </div>

                <div className='row'>
                    <div className='col-2 col-sm-5'></div>
                    <div className='col-9 col-sm-6 pr-2'>
                        { this.state.showNetworks ?
                            <div className='container-hidden-network'>
                                <div className='container-hidden-network-header'>Nodes</div>
                                <div className='container-hidden-network-body'>
                                    {options.network.map( (network, index) => {
                                        return(
                                            <div onClick={() => this.switchNetwork(network)} className='container-hidden-network-item'>

                                                <div className='container-icon-check'>
                                                    { this.state.network.id === network.id ?
                                                        <span className='fa fa-check'></span>
                                                        : ''}
                                                </div>
                                                { this.state.network.id === network.id ?
                                                    <div className='container-hidden-network-item-name-selected'>{network.name}</div>
                                                    : <div className='container-hidden-network-item-name-not-selected'>{network.name}</div>}
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                            : ''}
                    </div>
                    <div className='col-1'></div>
                </div>

            </header>

        );
    }
}

export default Header;
