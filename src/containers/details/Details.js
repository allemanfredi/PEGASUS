import React , { Component } from 'react';
import history from '../../components/history';

import "./Details.css";

class Details extends Component {

    constructor(props, context) {
        super(props, context);
        
        this.state = {
      };
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
                                                    {detail.value > 99999 || detail.value < -99999  ? (detail.value / 1000000).toFixed(2) + " Mi" : (detail.value > 999 || detail.value < -999 ?  (detail.value / 1000).toFixed(2) + " Ki"  :  detail.value + "i" )}
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
                            <button class="btn btn-promote-transaction">Promote transaction <span class="fa fa-repeat"></span></button>
                        </div>
                        <div class="col-1"></div>
                    </div>
                </div>
            </div>
        </div> 
      );
    }
  }

export default Details;