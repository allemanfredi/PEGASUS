import React , { Component } from 'react';
import { trytesToAscii } from '@iota/converter'
import { timestampToDateMilliseconds } from '../../../utils/helpers';


import './Data.css'

class Data extends Component {

    constructor(props, context) {
        super(props, context);
        
        this.showHideData = this.showHideData.bind(this);

        this.state = {
            hidden : {}
        } 
    }

    componentDidMount(){
        this.setState( () => {
            let hidden = {};
            this.props.data.forEach ( channel => {
                hidden[channel.deviceName] = false;
            });
            return {
                hidden
            }
        });
    }

    showHideData(data){
        this.setState( state => {
            let hidden = this.state.hidden;
            hidden[data.deviceName] = !hidden[data.deviceName];
            return {
                hidden
            }
        })
    }

    render() {
      return (
          <div className="container data">
            <div className="row">
                <div className="col-2 text-left">
                    <button onClick={() => this.props.onClose()} type="button" className="close btn-close float-left" aria-label="Close"><span aria-hidden="true">&times;</span></button>
                </div>
                <div className="col-10"/>
            </div>

             <div className="data-list">
                {this.props.data.map( (channel,cindex) => {
                    return (
                        <div key={channel.deviceName} className="container-data">
                            <div onClick={() => this.showHideData(channel)} className="container data-item">
                                <div className="row">
                                    <div className="col-10 channel-name">{channel.deviceName}</div>
                                    <div className="col-2">
                                        <button className="btn-show-data"><i className={this.state.hidden[channel.deviceName] ? "fa fa-eye" : "fa fa-eye-slash" }></i></button> 
                                    </div>
                                </div>
                                <div className="row">
                                    <div className="col-6 channel-info">Description:</div>
                                    <div className="col-6 text-right channel-description">{channel.description}</div>
                                </div>
                                <div className="row">
                                    <div className="col-6 channel-info">Owner:</div>
                                    <div className="col-6 text-right channel-description">alle</div>
                                </div>
                            </div>

                            <div className="container container-data-hidden">
                                {this.state.hidden[channel.deviceName] &&  channel.messages? 
                                channel.messages.map( (message,mindex) => {
                                    return (
                                        <div key={cindex.toString()+mindex.toString()} className="row data-item-hidden">
                                            <div className="col-3 text-left data-value">{Math.round(JSON.parse(trytesToAscii(message)).data * 100) / 100}</div>
                                            <div className="col-9 text-right data-timestamp">{JSON.parse(trytesToAscii(message)).timestamp ? timestampToDateMilliseconds(JSON.parse(trytesToAscii(message)).timestamp) : ''}</div>
                                        </div>
                                    )
                                })
                                : ''}
                            </div>
                        </div>
                    )
                })}
            </div>
          </div>
       
      );
    }
  }

export default Data;