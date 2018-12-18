import React , { Component } from 'react';
import {storePsw} from '../../wallet/wallet'
import history from '../../components/history';
import {aes256encrypt,sha256} from '../../utils/crypto'
import {Button,ControlLabel,HelpBlock,FormControl,Row,Col} from 'react-bootstrap';
import {getAccountData} from '../../core/core';
import {generateSeed,addAccount,setupWallet,setCurrentNetwork} from '../../wallet/wallet';

import options from '../../options/options';

class Init extends Component {

    constructor(props, context) {
      super(props, context);

      this.handleChangePsw = this.handleChangePsw.bind(this);
      this.handleChangeRePsw = this.handleChangeRePsw.bind(this);
      this.handleChangeName = this.handleChangeName.bind(this);
      this.clickCreatePassword = this.clickCreatePassword.bind(this);
      this.clickGenerateNewAddres = this.clickGenerateNewAddres.bind(this);
      this.clickGenerateSeed = this.clickGenerateSeed.bind(this);

      this.state = {
        psw: '',
        repsw: '',
        error: '',
        name : '',
        isLoading : '',
        showPsw: true,
        showSeed: false
      };
    }


    clickCreatePassword(){
      if ( this.state.psw === this.state.repsw ){
        
        if ( storePsw(this.state.psw)){
          this.setState({showPsw:false});
          this.setState({showSeed:true});
        }
      }
      else{
          this.setState({error : 'passwords not equal'});
      }
    }

    clickGenerateSeed(){
        this.setState({ seed: generateSeed() });
    }
  
    async clickGenerateNewAddres() {
        this.setState({isLoading : true});

        try{
            if ( setupWallet() ){
                
                //TODO: come salvare la psw in plaintext (sol: session storage )
                //piu sicuro: chiedere la psw per ogni send cosi da salvare solo l'hash della psw
                //mi tengo la chiave di cifratura del seed nella ram invece che salvarmela nel session storage
                const pswHash = sha256(this.state.psw);
                const eseed = aes256encrypt(this.state.seed,pswHash);

                //get all account data
                let data = await getAccountData(this.state.seed);
                
                let account = {
                    name : this.state.name,
                    seed : eseed,
                    data : data,
                    network : options.network[0] //TESTNET = 0  MAINNET = 1 PER ADESSO GENERO SULLA TESTNET
                }
                await addAccount(account);
                await setCurrentNetwork(options.network[0])
                history.push('/home');
            }
        }catch(err){
            console.log(err.error);
            this.setState({isLoading : true});
        }
    }

    handleChangePsw(e) {
        this.setState({ psw: e.target.value });
    }

    handleChangeRePsw(e) {
        this.setState({ repsw: e.target.value });
    }
    handleChangeName(e) {
        this.setState({ name: e.target.value });
    }

    
    render() {
      return (
       <div>
           { this.state.isLoading ? ('Creating account....' )  : (
               <div>
                    <ControlLabel>Please insert the passphrase</ControlLabel>
                    <FormControl type="text" value={this.state.value} placeholder="Enter password"    onChange={this.handleChangePsw}/> 
                    <FormControl type="text" value={this.state.value} placeholder="Re-Enter password" onChange={this.handleChangeRePsw}/> 
                    <FormControl type="text" value={this.state.name}  placeholder="Enter name       " onChange={this.handleChangeName}/> 
                    <FormControl.Feedback />
                    <HelpBlock>Enter the pasword </HelpBlock>
                    <Button bsStyle="primary" onClick={this.clickCreatePassword}>Next</Button>
                    {this.state.error}


                    <Row className="show-grid">
                    <Col xs={6} md={4}>
                        <Button bsStyle="primary" onClick={this.clickGenerateSeed}>Generate a seed</Button>
                    </Col>
                    <Col xs={12} md={8}>
                        {this.state.seed}
                    </Col>
                    </Row>
                    <Row className="show-grid">
                    <Col xs={6} md={4}>
                        <Button bsStyle="primary" onClick={this.clickGenerateNewAddres}>Create Wallet</Button>
                    </Col>
                    <Col xs={12} md={8}>
                        {this.state.address}
                    </Col>
                    </Row>
                </div>
           )}
       </div>
      );
    }
  }

export default Init;