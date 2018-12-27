import React , { Component } from 'react';
import {getAllTransactions,getLatestInclusion,getBundle} from '../../core/core'
import {timestampToDate} from '../../utils/helpers'

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

        let obj = {
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
            {this.state.transactions.lenght > 0 ? this.state.transactions.map(transaction => {
                return (
                <div class="transaction-list-item" >
                    <div class="transaction-list-item-action">{transaction.value > 0 ? 'RECEIVED ' : 'SENT'}</div>
                    <div class="transaction-list-item-date">{timestampToDate(transaction.timestamp)}</div>
                    <div class="transaction-list-item-value">{transaction.value}</div>
                    {transaction.status ? (
                    <div class="transaction-status-confirmed">confirmed</div>
                    ) : (
                    <div class="transaction-status-not-confirmed">pending</div>
                    )}
                    <div class="transaction-list-item-details">
                        <a href="#" onClick={() => this.goDetails(transaction.transfer)} data-scroll>
                            <span>show details</span>
                        </a>
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