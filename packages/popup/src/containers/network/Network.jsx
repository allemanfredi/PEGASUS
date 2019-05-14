import React, { Component } from 'react';


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

    addNetwork(){
        console.log(this.state);
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
                        <button onClick={this.addNetwork} type='submit' className='btn btn-blue text-bold btn-big'>Add</button>
                    </div>
                    <div className='col-1'></div>
                </div> 
            
                
            </div>
        );
    }
}

export default Network;