import React, { Component } from 'react';
import { PopupAPI } from '@pegasus/lib/api';


class Network extends Component {
    constructor(props, context) {
        super(props, context);

        this.addNetwork = this.addNetwork.bind(this);

        this.state = {
            name : '',
            url : '',
            port : '',
            type : ''
        }
    }

    async addNetwork(){
        const network = {
            name : this.state.name,
            provider : this.state.url + ':' + this.state.port,
            link : this.state.type === 'mainnet' ? 'https://thetangle.org/' : 'https://devnet.thetangle.org/',
            type : this.state.type,
            difficulty : this.state.type === 'mainnet' ? 14 : 9,
            default : false
        }
        this.props.onAddNetwork(network);
    }

    render() {
        return (
            <div className='container'>
                <div className="row mt-4">
                    <div className="col-12">
                        <label htmlFor='inp-node-name' className='inp'>
                            <input value={this.state.name} onChange={e => this.setState({ name: e.target.value })} type='text' id='inp-node-name' placeholder='&nbsp;'/>
                            <span className='label'>Name</span>
                            <span className='border'></span>
                        </label>
                    </div>
                </div>  

                <div className="row mt-4">
                    <div className="col-12">
                        <label htmlFor='inp-node-url' className='inp'>
                            <input value={this.state.url} onChange={e => this.setState({ url: e.target.value })} type='text' id='inp-node-url' placeholder='&nbsp;'/>
                            <span className='label'>URL</span>
                            <span className='border'></span>
                        </label>
                    </div>
                </div> 

                <div className="row mt-4">
                    <div className="col-12">
                        <label htmlFor='inp-node-port' className='inp'>
                            <input value={this.state.port} onChange={e => this.setState({ port: e.target.value })} type='text' id='inp-node-port' placeholder='&nbsp;'/>
                            <span className='label'>Port</span>
                            <span className='border'></span>
                        </label>
                    </div>
                </div> 

                <div className="row mt-4">
                    <div className="col-4 text-left">
                        <input onChange={ () => this.setState({type:'mainnet'})} name="network" id="mainnet" type="radio" value="Base"/>
                        <label for="mainnet" class="text-xxs">Mainnet</label>
                    </div>

                     <div className="col-4 text-left">
                        <input onChange={() => this.setState({type:'testnet'})}  name="network" id="testnet" type="radio" value="Base"/>
                        <label for="testnet" class="text-xxs">Testnet</label>
                    </div>
                </div>

                <div className='row mt-8'>
                    <div className='col-1'></div>
                    <div className='col-10 text-center'>
                        <button disabled={  this.state.name === '' || 
                                            this.state.url === ''  ||
                                            this.state.port === '' ||
                                            this.state.type === '' ? true : false} onClick={this.addNetwork} type='submit' className='btn btn-blue text-bold btn-big'>Add</button>
                    </div>
                    <div className='col-1'></div>
                </div> 
            
                
            </div>
        );
    }
}

export default Network;