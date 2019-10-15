import React, { Component } from 'react';
import Utils from '@pegasus/lib/utils';

class Details extends Component {
  constructor(props, context) {
    super(props, context);

    this.state = {};
  }

  render() {
    return (
      <div>
        <hr className="mt-1" />
        <div className='row mt-1'>
          <div className="col-2 text-xxs text-blue text-bold text-left">bundle:</div>
          <div className='col-10 text-right text-xxs'>
            <div className="text-no-overflow">{this.props.details[0].bundle}</div>
          </div>
        </div>
        <div className='mt-1'>
          <ul className='list-group'>
            {
              this.props.details.map(detail => {
                return (
                  <li key={detail.hash} className='list-group-item'>
                    <div className='row'>
                      <div className='col-8 text-xxxs text-no-overflow text-left'>
                        {detail.hash}
                      </div>
                      <div className='col-4 text-blue text-xxs text-bold text-right'>
                        {Utils.iotaReducer(detail.value)}
                      </div>
                    </div>
                  </li>
                );
              })
            }
          </ul>
        </div>
        <div className='row mt-1'>
          <div className='col-6'>
            <button onClick={() => this.props.replayBundle(this.props.details[0].hash)} disabled={this.props.details[0].persistence ? true : false} className='btn btn-border-blue text-xs btn-small'>Reattach <span className='fa fa-link'></span></button>
          </div>
          <div className='col-6'>
            <button onClick={() => this.props.promoteTransaction(this.props.details[0].hash)} disabled={this.props.details[0].persistence ? true : false} className='btn btn-border-blue text-xs btn-small'>Promote <span className='fa fa-repeat'></span></button>
          </div>
        </div>
      </div>
    );
  }
}

export default Details;