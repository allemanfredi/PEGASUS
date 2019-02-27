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
            await replayBundle(hash);
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
            <div className="modal">

                <div className="container-details">
                    <div className="container-button-close">
                        <div className="row">
                            <div className="col-2 text-center">
                                <button onClick={() => this.props.onClose()} type="button" className="close btn-close-details float-left" aria-label="Close"><span aria-hidden="true">&times;</span></button>
                            </div>
                            <div className="col-10"></div>
                        </div>  
                    </div>

                    <div className="container-details-title">
                        <div className="row">
                            <div className="col-12 text-center">
                                <div className="details-title">Bundle details</div>
                            </div>
                        </div>
                    </div>  

                    <div className="container-details-bundle">
                        <div className="row">
                            <div className="col-1"></div>
                            <div className="col-10 text-center">
                                <div className="detail-bundle-value">{this.props.details[0].bundle}</div>
                            </div>
                            <div className="col-1"></div>
                        </div>
                    </div>  
                    
                    <div className="container-list-details">
                        <ul className="list-group details-list">
                            {this.props.details.map( detail => {
                                return (<li key={detail.hash} className="list-group-item">
                                            <div className="row">
                                                <div className="col-8">
                                                    <div className="detail-hash" >{detail.hash} </div>
                                                </div>
                                                <div className="col-4">
                                                    <div className="detail-value">
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
                    
                    <div className="container-promote-transaction">
                        <div className="row">
                            <div className="col-1"></div>
                            <div className="col-10">
                                <button onClick={() => this.promoteTransaction(this.props.details[0].hash)} disabled={this.props.details[0].persistence ? true : false} className="btn btn-promote-transaction">Promote transaction <span className="fa fa-repeat"></span></button>
                            </div>
                            <div className="col-1"></div>
                        </div>
                    </div>

                    <div className="container-reattach-transaction">
                        <div className="row">
                            <div className="col-1"></div>
                            <div className="col-10">
                                <button onClick={() => this.replayBundle(this.props.details[0].hash)} disabled={this.props.details[0].persistence ? true : false} className="btn btn-reattach-transaction">Reattach transaction <span className="fa fa-link"></span></button>
                            </div>
                            <div className="col-1"></div>
                        </div>
                    </div>

                    <div className="container-promote-transaction-suggestion">
                        <div className="row">
                            <div className="col-1"></div>
                            <div className="col-10 text-center">
                                <div className="text-promote-transaction-suggestion">In case you transaction is pending for some time, you can click these buttons</div>
                            </div>
                            <div className="col-1"></div>
                        </div>
                    </div>
                </div>

                {this.state.showAlert ? <Alert text={this.state.alerText} type={this.state.alertType} onClose={this.onCloseAlert}/> : ''}

        </div> )
    }
  }

export default Details;