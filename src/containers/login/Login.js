import React , { Component } from 'react';
import {Button,ControlLabel,HelpBlock,FormControl} from 'react-bootstrap';
import {checkPsw} from '../../wallet/wallet'
import {startSession} from '../../utils/utils'
import history from '../../components/history';

class InitPsw extends Component {

    constructor(props, context) {
      super(props, context);

      this.clickLogin = this.clickLogin.bind(this);
      this.handleChangePsw = this.handleChangePsw.bind(this);

      this.state = {
        psw: '',
        error: ''
      };
    }


    clickLogin(){
    
        if ( checkPsw(this.state.psw ) ){
            if ( startSession() ) history.push('/home');
        }
    }

    handleChangePsw(e) {
      this.setState({ psw: e.target.value });
    }


    render() {
      return (
       <div>
            <ControlLabel>Please insert the psw</ControlLabel>
            <FormControl type="text" value={this.state.psw} placeholder="psw" onChange={this.handleChangePsw}/> 
            <FormControl.Feedback />
            <HelpBlock>Enter the pasword </HelpBlock>
            <Button bsStyle="primary" onClick={this.clickLogin}>Log In</Button>
            {this.state.error}
        </div>
      );
    }
  }

export default InitPsw;