const { composeAPI } = require('@iota/core')
const { asciiToTrytes } = require('@iota/converter')
const {extractJson} = require('@iota/extract-json');

const {sha256,randomBytes} = require('./crypto');
const {byteToChar} = require('./helpers')



let iota;

const iotaInit = async provider => {
    iota = composeAPI({
        provider : provider
    })
    return iota;
}

const getNodeInfo = async () => {
    return new Promise ((resolve , reject ) => {
        iota.getNodeInfo()
        .then(info =>  resolve(info))
        .catch(err => reject(err))
    });
}

const getNewAddress = async seed => {
    return new Promise ((resolve , reject ) => {
        iota.getNewAddress(seed)
            .then(address => resolve(address))
            .catch(err => reject(err))
    });
}

const getBalance = async address => {
    return new Promise ((resolve , reject) => {
        iota.getBalances([address], 100)
            .then(res => resolve(res.balances[0]))
            .catch(err =>  reject(err))
    })
}

const getAllTransactions = async addresses => {
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
        tag: transfer.tag ? asciiToTrytes(JSON.stringify(transfer.tag)) : "999",
        message: asciiToTrytes(JSON.stringify(transfer.message)) // optional message in trytes
    }]
    const depth = 3;

    // Difficulty of Proof-of-Work required to attach transaction to tangle.
    // Minimum value on mainnet & spamnet is `14`, `9` on devnet and other testnets.
    const minWeightMagnitude = transfer.difficulty;

    const inputs = await iota.getInputs(transfer.seed);

    try{
        iota.prepareTransfers(transfer.seed, transfers )
        .then(trytes => {
            return iota.sendTrytes(trytes, depth, minWeightMagnitude);
        })
        .then(bundle => {
            ret(bundle[0].bundle,null);
        })
        .catch(err => {
            ret(null,err);
        })
    }catch(err){
        ret(null,err);
    }
}

const getLatestInclusion = async hashes => {
    return new Promise (async (resolve,reject) => {
        iota.getLatestInclusion(hashes)
        .then(states => resolve(states))
        .catch(err => reject(err))
    })
}


const getAccountData = async seed => {
    return new Promise ((resolve,reject) => {
        iota.getAccountData(seed, {start: 0,security: 2})
           .then(accountData => {
             resolve(accountData);
           })
           .catch(err => {
            console.log(err);
            reject(err);
           })
    })
}

const getAccountDataSync = seed => {
    iota.getAccountData(seed, {start: 0,security: 2})
        .then(accountData => {
            console.log(accountData);
        return accountData;
        })
        .catch(err => {
        console.log(err);
        return err;
        })
}

const getBundle = async transaction => {
    return new Promise ((resolve,reject) => {
        iota.getBundle(transaction)
        .then(bundle => {
            resolve(bundle);
        })
        .catch(err => {
            console.log(err);
            reject(err);
        })
    })
}

const isPromotable = async tail => {
    return new Promise ( (resolve,reject) => {
        iota.isPromotable(tail , {rejectWithReason: true})
        .then(isPromotable => {
            console.log(isPromotable);
            resolve(isPromotable);
        }).catch(err => {
            console.log(isPromotable);
            reject(err);
        })
    });
}

const promoteTransaction = async (tail ) => {
    return new Promise ((resolve,reject) => {
        try{
            iota.promoteTransaction(tail, 3, 14)
             .then(() => {
                resolve();
            })
            .catch(err => {
                reject(err);
            });
        }catch(err){
            reject(err);
        }
    });
}

const replayBundle = async tail => {
    return new Promise((resolve,reject) => {
        iota.replayBundle(tail,3,14)
          .then(transactions => {
              resolve(transactions);
          })
          .catch(err => {
              reject(err);
          });
    });
}

const generateSeed = (length = 81) => {
    const bytes = randomBytes(length, 27);
    const seed = bytes.map(byte =>  byteToChar(byte));
    return seed;
}

const findTransactionObject = async options => {
	return new Promise((resolve,reject) => {
		iota.findTransactionObjects(options)
		.then(transactions => {
		   resolve(transactions)
		})
		.catch(err => {
		   reject(err);
		})
	});
}

const getInputs = async seed => {
  return new Promise ( async (resolve,reject) => {
    iota.getInputs(seed)
    .then((inputs) => {
      resolve(inputs);
    })
    .catch(err => {
      console.log(err);
      reject(err);
    })
  })
}

const getMessage = async tail => {
  return new Promise ( async (resolve,reject) => {
    const bundle = await getBundle(tail);
    try{
      const message = JSON.parse(extractJson(bundle));
      resolve(message);
    }catch(err){
      console.log(err);
    }
  });
}



module.exports =  {	getNewAddress,
					getNodeInfo,
					iotaInit,
					getBalance,
					getAllTransactions,
					prepareTransfer,
					getLatestInclusion,
					getAccountData,
					getBundle,
					promoteTransaction,
					replayBundle,
					getAccountDataSync,
					isPromotable,
					generateSeed,
					findTransactionObject,
          getInputs,
          getMessage
        }
