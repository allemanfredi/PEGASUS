import React , { Component } from 'react';
import {promoteTransaction,replayBundle} from '../../core/core'; 

import Alert from '../../components/alert/Alert';

import "./Details.css";

class Details extends Component {

    constructor(props, context) {
        super(props, context);

        this.promoteTransaction = this.promoteTransaction.bind(this);
        this.replayBundle = this.replayBundle.bind(this);
        this.onCloseAlert = this.onCloseAlert.bind(this);

        this.state = {
            showAlert : false,
            alertType : '',
            alerText : ''
        }
    }

    async promoteTransaction(hash){
        try{
            await promoteTransaction(hash);
        }catch(err){
            this.setState({showAlert:true});
            this.setState({alertType:'error'});
            this.setState({alerText:err.message});
        } 
    }

    async replayBundle(hash){
        try{
            const transactions = await replayBundle(hash);
        }catch(err){
            this.setState({showAlert:true});
            this.setState({alertType:'error'});
            this.setState({alerText:err.message});
        } 
    }

    onCloseAlert(){
        this.setState({showAlert:false});
        this.setState({alerText:''});
        this.setState({alertType:''});
    }

    render() {
      return (
            <div class="modal">

                <div class="container-info">
                    <div class="container-button-close">
                        <div class="row">
                            <div class="col-2 text-center">
                                <button onClick={() => this.props.onClose()} type="button" class="close btn-close-details" aria-label="Close"><span aria-hidden="true">&times;</span></button>
                            </div>
                            <div class="col-10"></div>
                        </div>  
                    </div>

                    <div class="container-details-title">
                        <div class="row">
                            <div class="col-12 text-center">
                                <div class="details-title">Bundle details</div>
                            </div>
                        </div>
                    </div>  

                    <div class="container-details-bundle">
                        <div class="row">
                            <div class="col-1"></div>
                            <div class="col-10 text-center">
                                <div class="detail-bundle-value">{this.props.details[0].bundle}</div>
                            </div>
                            <div class="col-1"></div>
                        </div>
                    </div>  
                    
                    <div class="container-list-details">
                        <ul class="list-group details-list">
                            {this.props.details.map( detail => {
                                return (<li class="list-group-item">
                                            <div class="row">
                                                <div class="col-8">
                                                    <div class="detail-hash" >{detail.hash} </div>
                                                </div>
                                                <div class="col-4">
                                                    <div class="detail-value">
                                                        {detail.value > 99999999 || detail.value < -99999999 ? (detail.value / 1000000000).toFixed(2) + " Gi" : 
                                                         detail.value > 99999 || detail.value < -99999  ? (detail.value / 1000000).toFixed(2) + " Mi" :
                                                         detail.value > 999 || detail.value < -999 ?  (detail.value / 1000).toFixed(2) + " Ki"  :  
                                                         detail.value + "i" }
                                                    </div>
                                                </div>
                                            </div>
                                        </li>);
                            })}
                        </ul>
                    </div>
                    
                    
                    <div class="container-promote-transaction">
                        <div class="row">
                            <div class="col-1"></div>
                            <div class="col-10">
                                <button onClick={() => this.promoteTransaction(this.props.details[0].hash)} disabled={this.props.details[0].persistence ? true : false} class="btn btn-promote-transaction">Promote transaction <span class="fa fa-repeat"></span></button>
                            </div>
                            <div class="col-1"></div>
                        </div>
                    </div>

                    <div class="container-reattach-transaction">
                        <div class="row">
                            <div class="col-1"></div>
                            <div class="col-10">
                                <button onClick={() => this.replayBundle(this.props.details[0].hash)} disabled={this.props.details[0].persistence ? true : false} class="btn btn-reattach-transaction">Reattach transaction <span class="fa fa-link"></span></button>
                            </div>
                            <div class="col-1"></div>
                        </div>
                    </div>

                    <div class="container-promote-transaction-suggestion">
                        <div class="row">
                            <div class="col-1"></div>
                            <div class="col-10 text-center">
                                <div class="text-promote-transaction-suggestion">In case you transaction is pending for some time, you can click these buttons</div>
                            </div>
                            <div class="col-1"></div>
                        </div>
                    </div>
                </div>

                {this.state.showAlert ? <Alert text={this.state.alerText} type={this.state.alertType} onClose={this.onCloseAlert}/> : ''}

        </div> )
    }
  }

export default Details;