import React, { Component } from 'react';
import MessageDuplex from '@pegasus/lib/MessageDuplex';
import { PopupAPI } from '@pegasus/lib/api';
import IOTA from '@pegasus/lib/iota';


import Header from './header/Header';
import Main from './main/Main';
import options from '@pegasus/lib/options';
import { APP_STATE } from '@pegasus/lib/states';



class App extends Component {
    constructor(props, context) {
        super(props, context);

        this.main = React.createRef();
        this.header = React.createRef();

        this.onHandleLogin = this.onHandleLogin.bind(this);
        this.onShowHeader = this.onShowHeader.bind(this);
        this.onHandleNetworkChanging = this.onHandleNetworkChanging.bind(this);
        this.bindDuplexRequests = this.bindDuplexRequests.bind(this);
        this.onAddCustomNetwork = this.onAddCustomNetwork.bind(this);

        this.state = {
            isLogged: false,
            network: {},
            networks : [],
            account : {},
            showHeader: false,
            duplex: new MessageDuplex.Popup(),
        };
    }

    async componentWillMount() {

        PopupAPI.init(this.state.duplex);
        this.bindDuplexRequests();

        //check if the current network has been already set, if no => set to testnet (options[0])
        const network = await PopupAPI.getCurrentNetwork();
        const networks = await PopupAPI.getAllNetworks();
        IOTA.init(network.provider);
        this.setState(() => {
            return {
                network,
                networks
            }
        })
    }

    onHandleLogin(value) {
        this.setState({ isLogged: value });
    }

    onShowHeader(value) {
        this.setState({ showHeader: value });
    }

    onHandleNetworkChanging(network) {
        IOTA.setProvider(network.provider);
        PopupAPI.setCurrentNetwork(network);
        
        //transactions handler for new network
        PopupAPI.stopHandleAccountData();
        PopupAPI.startHandleAccountData();
    }

    async onAddCustomNetwork(){
        const state = await PopupAPI.getState();
        if ( state >= APP_STATE.WALLET_UNLOCKED )
            this.main.current.addCustomNetwork();
    }

    bindDuplexRequests(){
        this.state.duplex.on('setPayments', payments => this.main.current.changePayments(payments));
        this.state.duplex.on('setConfirmationLoading', isLoading => this.main.current.setConfirmationLoading(isLoading));
        this.state.duplex.on('setConfirmationError', error => this.main.current.setConfirmationError(error));
        this.state.duplex.on('setAccount', account => this.setState({account}));
        this.state.duplex.on('setNetworks', networks => this.setState({networks}));
        this.state.duplex.on('setNetwork', network => this.setState({network}));
    }

    render() {
        return (
            <div className="app-wrapper">
                <div className="app chrome">
                    {this.state.showHeader ? <Header    ref={this.header} 
                                                        network={this.state.network}
                                                        networks={this.state.networks}
                                                        isLogged={this.state.isLogged} 
                                                        changeNetwork={this.onHandleNetworkChanging}
                                                        addCustomNetwork={this.onAddCustomNetwork}/> : '' }
                    <Main   showHeader={this.onShowHeader} 
                            ref={this.main} 
                            network={this.state.network}
                            account={this.state.account}/>
                </div>
            </div>

        );
    }
}

export default App;
