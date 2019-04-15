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
        <div className="modal">
            <div className="container-alert">

                <div className="container-btn-close-alert">
                    <div className="row">
                        <div className="col-2">
                            <button onClick={() => this.props.onClose()} type="button" className="close" aria-label="Close"><span aria-hidden="true">&times;</span></button>
                        </div>
                        <div className="col-10"/>

                    </div>
                </div>

                <div className="container-logo-alert">
                    <div className="row">
                        <div className="col-12 text-center">
                            {this.props.type === 'error' ? <img src="./material/img/error.png" height="90" width="90" alt='error'/> :
                             this.props.type === 'success' ? <img src="./material/img/success.png" height="90" width="90" alt='success'/> :
                             this.props.type === 'loading' ? <div className="loading"></div> : '' }
                           
                        </div> 
                    </div>
                </div>

                <div className="container-text-alert">
                    <div className="row">
                        <div className="col-12 text-center">
                            <div className="text-alert">{this.props.text}</div>
                        </div> 
                    </div>
                </div>

            </div>
        </div>

      );
    }
}


