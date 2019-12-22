import React, { Component } from 'react'
import ReactJson from 'react-json-view'
import { popupMessanger } from '@pegasus/utils/messangers'
import Utils from '@pegasus/utils/utils'
import Alert from '../../../components/alert/Alert'
import Picklist from '../../../components/picklist/Picklist'

class MamExplorer extends Component {

  constructor(props, context) {

    super(props, context)

    this.onFetch = this.onFetch.bind(this)
    this.onClickDetail = this.onClickDetail.bind(this)

    this.state = {
      mode: 'mode',
      options: ['private', 'public', 'restricted'],
      root: '',
      sideKey: '',
      data: [],
      opened: [],
      showAlert: false,
      alertText: '',
      alertType: ''
    }
  }

  async componentWillMount() {
    this.props.duplex.on('newMamData', data => this.setState(
      {
        opened: [...this.state.opened, false],
        data: [...this.state.data, data]
      }
    ))
  }

  onClickDetail(index) {
    this.setState(prevState => {
      const opened = prevState.opened
      opened[index] = !opened[index]
      return {
        opened
      }
    })
  }

  onFetch() {
    this.setState({ data: [] })
    //check if root is a valid address
    if (!Utils.isValidAddress(this.state.root)) {
      this.setState(() => {
        const alertType = 'error'
        const alertText = 'Invalid root'
        const showAlert = true

        return {
          alertText,
          alertType,
          showAlert
        }
      })
      return
    }
    const options = {
      root: this.state.root,
      mode: this.state.mode,
      sideKey: this.state.sideKey !== '' ? this.state.sideKey : null
    }
    popupMessanger.startFetchMam(options)
  }

  render() {
    return (
      <React.Fragment>
        <React.Fragment>
          <div className='row mt-3'>
            <div className='col-12'>
              <label htmlFor='inp-root' className='inp'>
                <input value={this.state.root}
                  onChange={e => this.setState({ root: e.target.value })} 
                  type='text' 
                  id='inp-root'
                  placeholder='&nbsp;'/>
                <span className='label'>root</span>
                <span className='border'></span>
              </label>
            </div>
          </div>
          <div className='row mt-3'>
            <div className='col-12'>
              <Picklist placeholder="mode"
                text={this.state.mode}
                options={this.state.options}
                onSelect={mode => this.setState({ mode })} />
            </div>
          </div>
          {
            this.state.mode === 'restricted' 
              ?
                <div className='row mt-3'>
                  <div className='col-12'>
                    <label htmlFor='inp-address' className='inp'>
                      <input value={this.state.sideKey} onChange={e => this.setState({ sideKey: e.target.value })} type='text' id='inp-sideKey' placeholder='&nbsp;' />
                      <span className='label'>Side Key</span>
                      <span className='border'></span>
                    </label>
                  </div>
                </div>
              : ''
          }
          <div className='row mt-3'>
            <div className='col-12 text-center'>
              <button onClick={this.onFetch} 
                disabled={this.state.root === '' || this.state.mode === 'mode' ? true : false} 
                className='btn btn-blue text-bold btn-big'>
                  Fetch
              </button>
            </div>
          </div>
          {
            this.state.data.length > 0 
              ? <hr className="mt-3 mb-3"/> 
              : ''
          }
          {
            this.state.data.map((data, index) => {
              return (
                <div className="row mb-1">
                  <div className="col-12 ">
                    <div className="mam-data-box">
                      <div onClick={() => this.onClickDetail(index)} className="row cursor-pointer">
                        <div className="col-10">
                          {index}
                        </div>
                        <div className="col-2 text-right">
                          <i className={this.state.opened[index] ? "fa fa-angle-up" : "fa fa-angle-down"}></i>
                        </div>
                      </div>
                      {
                        this.state.opened[index] 
                        ?
                         <div className="row mt-2">
                            <div className="col-12">
                              {
                                Utils.isObject(data)
                                  ? <ReactJson src={data} />
                                  : data
                              }
                            </div>
                          </div>
                        : ''
                      }
                    </div>
                  </div>
                </div>
              )
            })
          }
        </React.Fragment>
        {
          this.state.showAlert 
            ?
              <Alert text={this.state.alertText}
                type={this.state.alertType}
                onClose={() => this.setState({ showAlert: false })} />
            : ''
        }
      </React.Fragment>
    )
  }
}

export default MamExplorer