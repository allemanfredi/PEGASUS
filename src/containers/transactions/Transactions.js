import React , { Component } from 'react';

import './Transactions.css'

class Transactions extends Component {

    constructor(props, context) {
        super(props, context);
        
        this.goDetails = this.goDetails.bind(this);

        this.state = {
            transactions : []
        }
    }

    componentDidMount(){
        this.updateData();
    }


   /* async updateData(){

        //get all txs
        console.log(this.props.addresses);
        const txs = await getAllTransactions(this.props.addresses);
        console.log("txxx");
        console.log(txs);

        //separate txs in base of their bundle
        // per check txs basta che almeno una tx all'interno di un bundle sia confirmed
        let obj = {};
        txs.forEach((tx,index) => {
            obj[tx.bundle] = txs.filter( item => item.bundle === tx.bundle);
        })
        console.log(obj);
     

        //prepare hashed
        const hashes = Array.from(txs , tx => tx.hash );

        //set the status
        const states = await getLatestInclusion(hashes);
        txs.forEach ( (tx , index) => tx['confirmed'] = states[index]);
        this.setState({transactions : txs});

    }*/

    async updateData(){
        let arr = [];
        let doubleBundle = [];
        this.setState({transactions: []});
        this.props.transfers.forEach(transfer => {
            //https://domschiener.gitbooks.io/iota-guide/content/chapter1/bundles.html
            //da gestire le meta tx

            if ( transfer.length === 0 )
                return;

            let value;
            if ( transfer[0].value < 0 ){ //RECEIVED
                value = -(transfer[0].value + transfer[3].value);
            }else{ //SENT
                value = -transfer[0].value;
            }

            const obj = {
                timestamp : transfer[0].attachmentTimestamp,
                value : value,
                status : transfer[0].persistence,
                bundle : transfer[0].bundle,
                index : transfer[0].currentIndex,
                transfer : transfer
            }

            //remove double bundle (reattachemen txs)
            //arr = arr.filter ( item => item.bundle != obj.bundle );
            //in questo modo prendo la prima transazione con stesso bundle 
            //cosi da escludere le reattachment transaction
            let add = true;
            for ( let tx of doubleBundle )
                if ( tx.bundle === obj.bundle )
                    add = false;
            if ( add ){
                arr.push(obj);
                doubleBundle.push(obj);
            }
        });
        const obj = {
            timestamp : 123456,
            value : 10,
            status : true,
            bundle : "jdhfjirdhfeif",
            index : 0,
            transfer : []
        }
        const obj2 = {
            timestamp : 333,
            value : 10,
            status : false,
            bundle : "jfhvif",
            index : 1,
            transfer : []
        }
        arr.push(obj);
        arr.push(obj2);
        arr.push(obj);
        arr.push(obj2);
        this.setState({transactions: arr});
    }

    async goDetails(transfer){
        this.props.goDetails(transfer);
    } 

    
    render() {
      return (
        <div class="container-transactions">
            <div class="transactions-header">
                <div class="row">
                    <div class="col-12">
                        <div class="transactions-name">
                            Transactions
                        </div>
                    </div>
                </div>
                <hr/>
            </div>
            <div class="transaction-list">
            {this.state.transactions.length > 0 ? this.state.transactions.map(transaction => {
                return (
                    <div onClick={() => this.goDetails(transaction.transfer)} class="transaction-list-item" >
                        <div class="row">
                            <div class="col-4 text-left">
                                <div class="transaction-list-item-action">{transaction.value > 0 ? 'Received ' : 'Sent'}</div>
                            </div>
                            <div class="col-4 text-center">
                                <div class="transaction-list-item-value"><strong>{transaction.value}</strong></div>
                            </div>
                            <div class="col-4 text-right">
                                <div class="transaction-status">{transaction.status ? 'Confirmed' : 'Pending'}</div>
                            </div>
                        </div>
                    </div>        
                );
            }) : 
                <div class="container-no-transactions">
                    <div class="row">
                        <div class="col-12 text-center">
                            <div class="text-no-transactions">No Transactions</div>
                        </div>
                    </div>
                </div>
            }
            </div>
        </div>
        
      );
    }
  }

export default Transactions;
