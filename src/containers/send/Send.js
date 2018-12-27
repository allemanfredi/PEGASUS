import React , { Component } from 'react';
import {prepareTransfer} from '../../core/core';
import {getCurrentAccount,getKey,getCurrentNewtwork} from '../../wallet/wallet';
import history from '../../components/history'
import {aes256decrypt} from '../../utils/crypto';


import './Send.css'

class Send extends Component {

    constructor(props, context) {
      super(props, context);
  
      this.clickTransfer = this.clickTransfer.bind(this);
      this.handleChangeDstAddress = this.handleChangeDstAddress.bind(this);
      this.handleChangeValue = this.handleChangeValue.bind(this);
      this.handleChangeMessage = this.handleChangeMessage.bind(this);
  
      this.state = {
        address : '',
        seed : '',
        dstAddress: '',
        value : 0,
        message: '',
        status: '',
        success: '',
      };
    }

    async componentDidMount(){ 
    }

    
    handleChangeDstAddress(e) {
        this.setState({ dstAddress: e.target.value });
    }

    handleChangeValue(e){
        this.setState({ value: e.target.value });
    }
    
    handleChangeMessage(e){
      this.setState({ message: e.target.value });
    } 


    async clickTransfer(){
      
      //get user seed in order to complete the transfer
      let account = this.props.account;

      //decrypt seed;
      const key = await getKey();
      const seed = aes256decrypt(account.seed,key);
      this.setState({seed : seed})

      //const address = 'IETGETEQSAAJUCCKDVBBGPUNQVUFNTHNMZYUCXXBFXYOOOQOHC9PTMP9RRIMIOQRDPATHPVQXBRXIKFDDRDPQDBWTY'
      let transfer = {
        seed : seed,
        to : this.state.dstAddress,
        value : this.state.value,
        message : this.state.message,
        difficulty : getCurrentNewtwork().type === "mainnet" ? 14 : 9
      }
      prepareTransfer( transfer , (bundle,error) => {

        if (bundle){
          console.log(bundle);
          this.setState({status : bundle});
          this.setState({success : true});
        }
        if (error){
          console.log(error);
          this.setState({status : error.message});
          this.setState({success : false});

        }
      });
    }

    render() {
      return (
        <div>
          IETGETEQSAAJUCCKDVBBGPUNQVUFNTHNMZYUCXXBFXYOOOQOHC9PTMP9RRIMIOQRDPATHPVQXBRXIKFDDRDPQDBWTY 
          <div class="container">
            <div class="row justify-content-md-center">
              <div class="col col-lg-2"></div>
              <div class="col-md-auto">
                <input type="text" value={this.state.dstAddress} onChange={this.handleChangeDstAddress} placeholder="address"/>
              </div>
              <div class="col col-lg-2"></div>
            </div>
            <div class="row justify-content-md-center">
              <div class="col col-lg-2"></div>
              <div class="col-md-auto">
                <input type="text" value={this.state.value} onChange={this.handleChangeValue} placeholder="value"/>
              </div>
              <div class="col col-lg-2"></div>
            </div>
            <div class="row justify-content-md-center">
              <div class="col col-lg-2"></div>
              <div class="col-md-auto">
                <input type="text" value={this.state.message} onChange={this.handleChangeMessage} placeholder="message"/>
              </div>
              <div class="col col-lg-2"></div>
            </div>
            <div class="row justify-content-md-center">
              <div class="col col-lg-2"></div>
              <div class="col-md-auto">
                <button onClick={this.clickTransfer} class="btn btn-primary">Send</button>
              </div>
              <div class="col col-lg-2"></div>
            </div>
          </div>
          {this.state.status}
        </div> 
      );
    }
  }

export default Send;