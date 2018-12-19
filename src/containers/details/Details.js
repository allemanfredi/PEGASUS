import React , { Component } from 'react';
import history from '../../components/history';

import "./Details.css";

class Details extends Component {

    constructor(props, context) {
        super(props, context);
        
        this.close = this.close.bind(this);

        this.state = {
      };
    }

    close(){
        this.props.onBack();
    }

    render() {
      return (
        <div class="modal">
            <div class="container-info">
                <div class="float-left">
                    <button onClick={this.close} type="button" class="close" aria-label="Close">
                        <span aria-hidden="true">&times;</span>
                    </button>
                </div>
                bundle details
                <ul class="list-group">
                    <li class="list-group-item">
                        <div class="row">
                            <div class="col-12">
                                <div class="detail-bundle">
                                    bundle {this.props.details[0].bundle}
                                </div>
                            </div>
                        </div>
                    </li>
                    {this.props.details.map( detail => {
                        return (<li class="list-group-item">
                                    <div class="row">
                                        <div class="col-10">
                                            <div class="detail-hash" >{detail.hash} </div>
                                        </div>
                                        <div class="col-2">
                                            <div class="detail-value">
                                                {detail.value > 99999 || detail.value < -99999  ? (detail.value / 1000000).toFixed(2) + " Ti" : (detail.value > 999 || detail.value < -999 ?  (detail.value / 1000).toFixed(2) + " Gi"  :  detail.value + "Mi" )}
                                            </div>
                                        </div>
                                    </div>
                                </li>);
                    })}
                </ul>
            </div>
        </div> 
      );
    }
  }

export default Details;