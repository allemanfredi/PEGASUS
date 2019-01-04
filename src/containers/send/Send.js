import React , { Component } from 'react';
import {prepareTransfer} from '../../core/core';
import {getKey,getCurrentNewtwork} from '../../wallet/wallet';
import {aes256decrypt} from '../../utils/crypto';
import Loader from '../../components/loader/Loader'

import './Send.css'

class Send extends Component {

    constructor(props, context) {
      super(props, context);
  
      this.clickTransfer = this.clickTransfer.bind(this);
      this.handleChangeDstAddress = this.handleChangeDstAddress.bind(this);
      this.handleChangeValue = this.handleChangeValue.bind(this);
      this.handleChangeMessage = this.handleChangeMessage.bind(this);
      this.closeError = this.closeError.bind(this);
  
      this.state = {
        address : '',
        seed : '',
        dstAddress: '',
        value : '',
        message: '',
        error: '',
        showError : false,
        success: '',
        isLoading : false
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

    closeError(){
      this.setState({showError:false});
    }


    async clickTransfer(){
      
      //check input parameters
      if ( this.state.dstAddress === '' ){
        this.setState({error : 'invalid input'});
        this.setState({showError : true});
        return;
      }

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
          this.setState({success : true});
        }
        if (error){
          console.log(error);
          this.setState({error : error.message});
          this.setState({showError : true});
          this.setState({success : false});

        }
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
                <button onClick={this.clickTransfer} class="btn btn-transfer"><i class="fa fa-paper-plane icon" ><strong> </strong></i></button>
              </div>
              <div class="col-1"></div>
            </div>

            <div class="row">
              <div class="col-1"></div>
              <div class="col-10 text-center">Send</div>
              <div class="col-1"></div>
            </div>
            
            {this.state.showError ? 
              <div class="container-error">
                <div class="alert alert-danger" role="alert">
                  <button onClick={this.closeError} type="button" class="close" data-dismiss="alert" aria-label="Close">
                      <span aria-hidden="true">&times;</span>
                  </button>
                  <strong>Error</strong> {this.state.error}
                </div>
              </div>
            : ''}
          </div>  
          
          : <Loader/>}
        </div>
      );
    }
  }

export default Send;