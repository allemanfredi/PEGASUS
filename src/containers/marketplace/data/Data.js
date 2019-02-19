import React , { Component } from 'react';
import { asciiToTrytes,trytesToAscii } from '@iota/converter'


import './Data.css'

class Data extends Component {

    constructor(props, context) {
        super(props, context);
        
        this.showHideData = this.showHideData.bind(this);

        this.state = {
            hidden : {}
        } 
    }

    componentWillMount(){
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
          <div class="data">
            <div class="row">
                <div class="col-2">
                    <button onClick={() => this.props.onClose()} type="button" class="close btn-close" aria-label="Close"><span aria-hidden="true">&times;</span></button>
                </div>
                <div class="col-10"/>
            </div>

             <div class="data-list">
                {this.props.data.map( channel => {
                    return (
                        <div class="container-data">
                            <div class="row data-item">
                                <div onClick={() => this.showHideData(channel)} class="col-12 text-center data-name">{channel.deviceName}</div>
                            </div>

                            <div class="data-hidden">
                                {this.state.hidden[channel.deviceName] ? 
                                channel.messages.map( message => {
                                    return (
                                        <div class="row data-item-hidden">
                                            <div class="col-12 text-center">{trytesToAscii(message)}</div>
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