import React, { Component } from 'react';

export default class Alert extends Component {
  constructor(props) {
    super(props);

    this.state = {}
  }

  render() {
    return (
      <div className='modal'>
        <div className='container-alert container bg-white container border-radius-5'>
          <div className='row mt-1'>
            <div className='col-2'>
              <button onClick={() => this.props.onClose()} type='button' className='close' aria-label='Close'><span aria-hidden='true'>&times;</span></button>
            </div>
            <div className='col-10' />
          </div>
          <div className='row mt-2    '>
            <div className='col-12 text-center'>
              {
                this.props.type === 'error' ? <img src='./material/img/error.png' height='90' width='90' alt='error' /> :
                  this.props.type === 'success' ? <img src='./material/img/success.png' height='90' width='90' alt='success' /> :
                    this.props.type === 'confirm' ? <img src='./material/img/question.png' height='90' width='90' alt='question' /> : ''
              }
            </div>
          </div>
          <div className='row mt-5'>
            <div className='col-12 text-center text-xs text-bold'>
              {this.props.text}
            </div>
          </div>
          {this.props.type === 'confirm' ?
            <div className="row mt-5 mb-2">
              <div className="col-6">
                <button onClick={() => this.props.onClose()} className='btn btn-border-blue btn-big'>Cancel</button>
              </div>
              <div className="col-6">
                <button onClick={() => this.props.onConfirm()} className='btn btn-blue btn-big'>Confirm</button>
              </div>
            </div>
            : <div className="row mt-5 mb-2">
              <div className="col-12">
                <button onClick={() => this.props.onClose()} className='btn btn-border-blue btn-big'>Cancel</button>
              </div>
            </div>
          }
        </div>
      </div>
    );
  }
}

