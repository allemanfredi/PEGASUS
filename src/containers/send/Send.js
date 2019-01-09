import React , { Component } from 'react';
import {prepareTransfer} from '../../core/core';
import {getKey,getCurrentNewtwork} from '../../wallet/wallet';
import {aes256decrypt} from '../../utils/crypto';

import Loader from '../../components/loader/Loader';
import Alert from '../../components/alert/Alert';

import './Send.css'

class Send extends Component {

    constructor(props, context) {
      super(props, context);
  
      this.clickTransfer = this.clickTransfer.bind(this);
      this.handleChangeDstAddress = this.handleChangeDstAddress.bind(this);
      this.handleChangeValue = this.handleChangeValue.bind(this);
      this.handleChangeMessage = this.handleChangeMessage.bind(this);
      this.onCloseAlert = this.onCloseAlert.bind(this);
  
      this.state = {
        address : '',
        seed : '',
        dstAddress: '',
        value : '',
        message: '',
        isLoading : false,
        showAlert : false,
        alertText : '',
        alertType : ''
      };
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

    onCloseAlert(){
      this.setState({showAlert:false});
      this.setState({alertText:''});
      this.setState({alertType:''});
    }


    async clickTransfer(){
      
      this.setState({isLoading:true});

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
          this.setState({alertText : 'Bundle : ' + bundle});
          this.setState({alertType : 'success'});
          this.setState({showAlert : true});
        }
        if (error){
          this.setState({alertText : error.message});
          this.setState({alertType : 'error'});
          this.setState({showAlert : true});
        }

        this.setState({dstAddress: '' });
        this.setState({value: '' });
        this.setState({message: '' });
        this.setState({isLoading:false});
      });
    }

    render() {
      return (

        <div>
          { !this.state.isLoading ?   
          <div class="container-send"> 

            <div class="row">
              <div class="col-1"></div>
              <div class="col-10">
                <label for="inp-address" class="inp">
                      <input value={this.state.dstAddress} onChange={this.handleChangeDstAddress}  type="text" id="inp-address" placeholder="&nbsp;"/>
                      <span class="label">address</span>
                      <span class="border"></span>
                </label>
              </div>
              <div class="col-1"></div>
            </div>

            <div class="row">
              <div class="col-1"></div>
                <div class="col-10">
                  <label for="inp-value" class="inp">
                      <input value={this.state.value} onChange={this.handleChangeValue} type="text" id="inp-value" placeholder="&nbsp;"/>
                      <span class="label">value</span>
                      <span class="border"></span>
                  </label>
                </div>
              <div class="col-1"></div>
            </div>

            <div class="row">
              <div class="col-1"></div>
                <div class="col-10">
                  <label for="inp-message" class="inp">
                      <input value={this.state.message} onChange={this.handleChangeMessage} type="text" id="inp-message" placeholder="&nbsp;"/>
                      <span class="label">message</span>
                      <span class="border"></span>
                  </label>
                </div>
              <div class="col-1"></div>
            </div>

            <div class="row">
              <div class="col-1"></div>
              <div class="col-10 text-center">
                <button disabled={this.state.dstAddress === '' ? true : false} onClick={this.clickTransfer} class="btn btn-transfer"><i class="fa fa-paper-plane" ></i></button>
              </div>
              <div class="col-1"></div>
            </div>

            <div class="row">
              <div class="col-1"></div>
              <div class="col-10 text-center">
                <div class="text-transfer">Send</div>
              </div>
              <div class="col-1"></div>
            </div>
            
            {this.state.showAlert ? <Alert text={this.state.alertText} type={this.state.alertType} onClose={this.onCloseAlert}/> : ''}
          </div>  
          
          : <Loader/>}
        </div>
      );
    }
  }

export default Send;