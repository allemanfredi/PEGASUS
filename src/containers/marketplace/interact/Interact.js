import React , { Component } from 'react';
import Map from '../../../components/map/Map'

import AddDevice from '../addDevice/AddDevice';
import Alert from '../../../components/alert/Alert';



import './Interact.css'

const Mam = require('../../../mam/lib/mam.client');
const { asciiToTrytes, trytesToAscii } = require('@iota/converter')


class Interact extends Component {

    constructor(props, context) {
      super(props, context);

      this.fetchPublicChannel = this.fetchPublicChannel.bind(this);
      this.onAddDevice = this.onAddDevice.bind(this);
      this.addDevice = this.addDevice.bind(this);
      this.onCloseAddDevice = this.onCloseAddDevice.bind(this);
      this.onBuy = this.onBuy.bind(this);
      this.onCloseAlert = this.onCloseAlert.bind(this);

      this.state = {
        interval : null,
        devices : [],
        showAddDevice : false,
        showAlert : false,
        alertText : '',
        alertType : '',
        mamPublicState : '',
        mamPublicRoot : '',
      }
    }

    async componentDidMount(){

      //init public channel where get the device positions
      const seedPublicChannel = 'REGUNAZAUXTI9LNUTRVKPDE9QJWZLBGJONJTNRUVIZIINYVKXZPVNEGBYWGQORZSECWD9TAGSLKKQVWHC';
      const s = Mam.init('https://testnet140.tangle.works',seedPublicChannel);
      this.setState({mamPublicState:s})
      
      const currentPublicRoot = Mam.getRoot(this.state.mamPublicState);
      this.setState({mamPublicRoot : currentPublicRoot})

      this.fetchPublicChannel(); 
      setInterval(this.fetchPublicChannel,30000);
    }

    async fetchPublicChannel(){
      const resp = await Mam.fetch(this.state.currentPublicRoot, 'public'); 
      this.setState({currentPublicRoot:resp.nextRoot});
      console.log(resp);
    }



    async addDevice(){
      this.setState({showAddDevice : true});
    }
    async onCloseAddDevice(){
      this.setState({showAddDevice : false});
    }

    async onAddDevice(device){

      /*this.setState({showAddDevice : false});

      this.setState({alertText : 'Fetching MAM channel...'});
      this.setState({alertType : 'loading'});
      this.setState({showAlert : true});

      
      try{
        //if receive a data it means that device is connected therefore i can save it on the db
        
        //if correct mam message
        if ( resp['nextRoot'] && resp['messages'] ){
          addDevice(device , () => {
            this.setState({alertText : 'Device succesfully added!!'});
            this.setState({alertType : 'success'});

            //load the new device
            getAllDevices( devices => {
              this.setState({devices : devices});
            })
          });
        }
        
      }catch(err){
        console.log(err);
        this.setState({alertText : 'Impossible to add the device'});
        this.setState({alertType : 'error'});
      }*/
    }

    onBuy(device){
      console.log("buy");
      console.log(device);
    }
    onCloseAlert(){
      this.setState({showAlert:false});
    }

    render() {
      return (
        <div>
          <div class="container-map">
            <Map devices={this.state.devices}
                 onBuy={this.onBuy}/>

            { this.state.showAddDevice ? 
              <AddDevice onAddDevice={this.onAddDevice}
                         onClose={this.onCloseAddDevice}/>
            : ''}

          </div> 
          {this.state.showAlert ?  <Alert text={this.state.alertText} type={this.state.alertType} onClose={this.onCloseAlert}/> : ''}
        </div>
        
      );
    }
  }

export default Interact;