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
          <div className="data">
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
                            <div onClick={() => this.showHideData(channel)} className="row data-item">
                                <div className="col-6 text-left data-name">{channel.deviceName}</div>
                                <div className="col-6 text-right data-name">{channel.description}</div>
                            </div>

                            <div className="data-hidden">
                                {this.state.hidden[channel.deviceName] &&  channel.messages? 
                                channel.messages.map( (message,mindex) => {
                                    return (
                                        <div key={cindex.toString()+mindex.toString()} className="row data-item-hidden">
                                            <div className="col-3 text-left data-value">{JSON.parse(trytesToAscii(message)).data}</div>
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