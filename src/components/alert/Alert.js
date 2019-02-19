import React, {Component} from 'react';

import './Alert.css'

export default class Alert extends Component {

  constructor(props) {
    super(props);

    this.state = {
      
    };
  }

  render() {
    return (
        <div class="modal">
            <div class="container-alert">

                <div class="container-btn-close-alert">
                    <div class="row">
                        <div class="col-2">
                            <button onClick={() => this.props.onClose()} type="button" class="close" aria-label="Close"><span aria-hidden="true">&times;</span></button>
                        </div>
                        <div class="col-10"/>

                    </div>
                </div>

                <div class="container-logo-alert">
                    <div class="row">
                        <div class="col-12 text-center">
                            {this.props.type === 'error' ? <img src="./material/img/error.png" height="90" width="90"/> :
                             this.props.type === 'success' ? <img src="./material/img/success.png" height="90" width="90"/> :
                             this.props.type === 'loading' ? <div class="loading"></div> : '' }
                           
                        </div> 
                    </div>
                </div>

                <div class="container-text-alert">
                    <div class="row">
                        <div class="col-12 text-center">
                            <div class="text-alert">{this.props.text}</div>
                        </div> 
                    </div>
                </div>

            </div>
        </div>

      );
    }
}


