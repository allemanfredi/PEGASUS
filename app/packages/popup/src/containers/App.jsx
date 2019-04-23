import React, { Component } from 'react';
import { iotaInit } from '../core/core';
import Header from './header/Header';
import Main from './main/Main';
import options from '../options/options';

import MessageDuplex from '@pegasus/lib/MessageDuplex';
import { PopupAPI } from '@pegasus/lib/api';

class App extends Component {
    constructor(props, context) {
        super(props, context);

        this.main = React.createRef();

        this.onHandleLogin = this.onHandleLogin.bind(this);
        this.onShowHeader = this.onShowHeader.bind(this);
        this.onHandleNetworkChanging = this.onHandleNetworkChanging.bind(this);
        this.bindDuplexRequests = this.bindDuplexRequests.bind(this);

        this.state = {
            isLogged: false,
            network: {},
            showHeader: false,
            duplex: new MessageDuplex.Popup(),
        };
        console.log(process.env.NODE_ENV);
    }

    async componentWillMount() {

        PopupAPI.init(this.state.duplex);

        //check if the current network has been already set, if no => set to testnet (options[0])
        let network = await PopupAPI.getCurrentNewtwork();
        console.log(network);
        if ( !network ) {
            network = options.network[ 0 ];
            await PopupAPI.setCurrentNetwork(options.network[ 0 ]);
            await iotaInit(options.network[ 0 ].provider);
        }
        else
            await iotaInit(network.provider);
        
        this.setState({ network });
    }

    onHandleLogin(value) {
        this.setState({ isLogged: value });
    }

    onShowHeader(value) {
        this.setState({ showHeader: value });
    }

    async onHandleNetworkChanging(network) {
        await iotaInit(network.provider);
        await PopupAPI.setCurrentNetwork(network);

        this.main.current.changeNetwork(network);
    }

    bindDuplexRequests(){
        console.log("todo");
    }

    render() {
        return (
            <div className={process.env.NODE_ENV === 'development' ? 'app-wrapper web' : 'app-wrapper'}>
                <div className={process.env.NODE_ENV === 'production' ? 'app chrome' : 'app web' }>
                    {this.state.showHeader ? <Header isLogged={this.state.isLogged} changeNetwork={this.onHandleNetworkChanging}/> : '' }
                    <Main   showHeader={this.onShowHeader} 
                            ref={this.main} 
                            currentNetwork={this.state.network}
                            PopupAPI={PopupAPI}/>
                </div>
            </div>

        );
    }
}

export default App;
