import React, { Component } from 'react';
import MessageDuplex from '@pegasus/lib/MessageDuplex';
import { PopupAPI } from '@pegasus/lib/api';
import IOTA from '@pegasus/lib/iota';


import Header from './header/Header';
import Main from './main/Main';
import options from '@pegasus/lib/options';



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
    }

    async componentWillMount() {

        PopupAPI.init(this.state.duplex);
        this.bindDuplexRequests();

        //check if the current network has been already set, if no => set to testnet (options[0])
        let network = await PopupAPI.getCurrentNetwork();
        IOTA.init(network.provider);
        this.setState({ network });
    }

    onHandleLogin(value) {
        this.setState({ isLogged: value });
    }

    onShowHeader(value) {
        this.setState({ showHeader: value });
    }

    async onHandleNetworkChanging(network) {
        IOTA.changeProvider(network.provider);
        PopupAPI.setCurrentNetwork(network);

        this.main.current.changeNetwork(network);
    }

    bindDuplexRequests(){
        this.state.duplex.on('setPayments', payments => this.main.current.changePayments(payments));
        this.state.duplex.on('setConfirmationLoading', isLoading => this.main.current.setConfirmationLoading(isLoading));
        this.state.duplex.on('setConfirmationError', error => this.main.current.setConfirmationError(error));
    }

    render() {
        return (
            <div className="app-wrapper">
                <div className="app chrome">
                    {this.state.showHeader ? <Header isLogged={this.state.isLogged} changeNetwork={this.onHandleNetworkChanging}/> : '' }
                    <Main   showHeader={this.onShowHeader} 
                            ref={this.main} 
                            currentNetwork={this.state.network}/>
                </div>
            </div>

        );
    }
}

export default App;
