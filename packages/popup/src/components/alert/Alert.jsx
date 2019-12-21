import React, { Component } from 'react'

class Alert extends Component {
  constructor(props) {
    super(props)

    this.state = {}
  }

  render() {
    return (
      <div className='modal'>
        <div className='container-alert container bg-white container border-radius-5'>
          <div className='row mt-05'>
            <div className='col-2'>
              <button onClick={() => this.props.onClose()} type='button' className="close mt-05 mr-05">
                <span className="fa fa-times"></span>
              </button>
            </div>
            <div className='col-10' />
          </div>
          <div className='row mt-1'>
            <div className='col-12 text-center'>
            {
              this.props.type === 'error' ? <img src='./material/img/error.png' height='80' width='80' alt='error' /> :
              this.props.type === 'success' ? <img src='./material/img/success.png' height='80' width='80' alt='success' /> :
              this.props.type === 'confirm' ? <img src='./material/img/question.png' height='80' width='80' alt='question' /> : ''
            }
            </div>
          </div>
          <div className='row mt-3'>
            <div className='col-12 text-center text-sm text-bold'>
              {this.props.text}
            </div>
          </div>
          {
            this.props.type === 'confirm'
              ? <div className="row mt-5 mb-1">
                  <div className="col-6 pr-5 pl-5">
                    <button onClick={() => this.props.onClose()} className='btn btn-border-blue btn-big'>
                      Cancel
                    </button>
                  </div>
                  <div className="col-6 pr-5 pl-5">
                    <button onClick={() => this.props.onConfirm()} className='btn btn-blue btn-big'>
                      Confirm
                    </button>
                  </div>
                </div>
              : <div className="row mt-6 mb-1 pr-5 pl-5">
                  <div className="col-12">
                    <button onClick={() => this.props.onClose()} className='btn btn-border-blue btn-big'>
                      OK
                    </button>
                  </div>
                </div>
          }
        </div>
      </div>
    )
  }
}

export default Alert