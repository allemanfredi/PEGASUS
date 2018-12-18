import { composeAPI } from '@iota/core'
import { asciiToTrytes } from '@iota/converter'



let iota;

const iotaInit = async (provider) => { 
    return new Promise ((resolve,reject) => {
        try{
            iota = composeAPI({
                provider : provider
            })
            resolve();
        }catch(e){
            reject(e);
        }  
    })
    
}

const getNodeInfo = async () => {

    return new Promise ((resolve , reject ) => {
        iota.getNodeInfo()
        .then(info =>  resolve(info))
        .catch(err => reject(err))
    });
}

const getNewAddress = async (seed) => {

    return new Promise ((resolve , reject ) => {
        iota.getNewAddress(seed)
            .then(address => resolve(address))
            .catch(err => reject(err))
    });
}

const getBalance = async (address) => {

    return new Promise ((resolve , reject) => {
        iota.getBalances([address], 100)
            .then(res => resolve(res.balances[0]))
            .catch(err =>  reject(err))
    })
}

const getAllTransactions = async (addresses) => {
    
    return new Promise ((resolve,reject) => {
        iota.findTransactionObjects({ addresses: addresses})
            .then( transactions => resolve(transactions))
            .catch( err => reject(err))
    })
}

const prepareTransfer = async (transfer,ret) => {

    const transfers = [{
        address: transfer.to,
        value: parseInt(transfer.value), 
        tag: '', // optional tag of `0-27` trytes
        message: asciiToTrytes(transfer.message) // optional message in trytes
    }]

    const depth = 3 

    // Difficulty of Proof-of-Work required to attach transaction to tangle.
    // Minimum value on mainnet & spamnet is `14`, `9` on devnet and other testnets.
    const minWeightMagnitude = transfer.difficulty;

    const inputs = await iota.getInputs(transfer.seed);
    try{
        iota.prepareTransfers(transfer.seed, transfers , inputs)
        .then(trytes => {
            return iota.sendTrytes(trytes, depth, minWeightMagnitude);
        })
        .then(bundle => {
            console.log(bundle);
            ret(bundle[0].hash,null);
        })
        .catch(err => {
            ret(null,err);
        }) 
    }catch(err){
        ret(null,err);
    }
}

const getLatestInclusion = async (hashes) => {
    
    return new Promise (async (resolve,reject) => {
        iota.getLatestInclusion(hashes)
        .then(states => resolve(states))
        .catch(err => reject(err))
    })
}


const getAccountData = async (seed) => {
    
    return new Promise ((resolve,reject) => {
        iota.getAccountData(seed, {start: 0,security: 2})
           .then(accountData => {
             resolve(accountData);
           })
           .catch(err => {
            reject(err);
           })
    })
}

const getBundle = async (transaction) => {
    return new Promise ((resolve,reject) => {
        iota.getBundle(transaction)
        .then(bundle => {
            resolve(bundle);
        })
        .catch(err => {
            reject(err);
        })
    })
}

/*Remember to reattach transactions once every 30 minutes that they remain pending. 
After 5 reattachments, contact the sender to make sure the transaction wasn't double spent.*/
const replayBundle = async (tail) => {
    console.log(tail);
    return new Promise((resolve,reject) => {
        iota.replayBundle(tail,3, 14)
            .then(transactions => {
                console.log(transactions)
                resolve(transactions);
            })
            .catch(err => {
                reject(err);
            })
    })
}

const promoteTransaction = async (hash) => {

    const spamTransfer = [{address: '9'.repeat(81), value: 0, message: '', tag: ''}]
    iota.promoteTransaction(hash, 3, 9, spamTransfer, {interrupt: false, delay: 0});
}

/*const promoteTransaction = async(hash) => {
    // We need to monitor inclusion states of all tail transactions (original tail & reattachments
    
    return new Promise ((resolve,reject) => {
        const tails = [hash]

        iota.getLatestInclusion(tails)
        .then(states => {
            // Check if none of transactions confirmed
            if (states.indexOf(true) === -1) {
                const tail = tails[tails.length - 1] // Get latest tail hash
    
                iota.isPromotable(tail)
                    .then(isPromotable => {
                        if ( isPromotable ){
                            //iota.promoteTransaction(tail, 3, 14)
                            console.log("promote transactio");
                            resolve();
                        }else{
                            iota.replayBundle(tail, 3, 14)
                                .then(([reattachedTail]) => {
                                    const newTailHash = reattachedTail.hash;
                                    // Keeping track of all tail hashes to check confirmation
                                    tails.push(newTailHash);
                                    resolve (newTailHash);
                                })
                        }
                    }).catch(err => {
                        console.log(err);
                        resolve(err);
                    })
            }
        }).catch(err => {
            // ...
        })
    })
}*/


export {getNewAddress, 
        getNodeInfo,
        iotaInit,
        getBalance,
        getAllTransactions,
        prepareTransfer,
        getLatestInclusion,
        getAccountData,
        getBundle,
        replayBundle,
        promoteTransaction};