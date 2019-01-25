
import {generateSeed} from '../wallet/wallet';
const {iotaInit,getNewAddress,prepareTransfer,findTransactionObject} = require('../core/core');

let seed;

const init = async (provider,channelSeed) => {
	return new Promise( async (resolve,reject) => {
		
		iotaInit(provider);
		seed = channelSeed;
		
		const channel = await getNewAddress(seed);
		const state =  {
			channel : channel,
			count : 0
		}
		resolve(state);
	});
}


/*const fetch = async channel => {
	return new Promise (async (resolve,reject) => {
		//il channel nel fetch è il next channel su cui fare il seed
		const options = {
			addresses : [channel]
		}
		
		console.log("fetching on " + channel );
		
		const transactions = await findTransactionObject(options);
		const newChannel = await getNewAddress(seed);
		
		console.log("after fetch " +  newChannel);
		
		const res = {
			transactions : transactions,
			channel : newChannel
		}
		resolve(res);
	});
}*/



const send = async (state,message) => {
	return new Promise (async (resolve,reject) => {
		
		//generate new state
		const newChannel = await getNewAddress(seed);
		console.log("sending " + newChannel);
		const newState = {
			channel : newChannel,
			count : state.count + 1
		}
		const pp = {
			pp : newState,
			message : message
		}
		
		const transfer = {
			seed : seed,
			to : newChannel,
			value : 0,
			message : pp,
			difficulty : 9 //for now testnet
		}
		prepareTransfer( transfer , async (bundle,error) => {
			resolve(newState);
		});
	});
}

const fetch = async channel => {
	
	//quanto transactions.lenght === 0 allora sono alla current root
	let array = [];
	const res = await findTransactions(channel,array);
	return res;
}

const findTransactions = async (channel,array) => {
		
	const options = {addresses : [channel]}
	const transactions = await findTransactionObject(options);
	/*const newChannel = await getNewAddress(seed);*/
	
	if ( transactions.length !== 0 ){
		const data = trytesToAscii(transactions[0].signatureMessageFragment.substring(0,transactions[0].signatureMessageFragment.length-1));
		const newData = data.replace(/\0.*$/g,'');
		const pp = {
			data : JSON.parse(newData),
			transaction : transactions[0].hash
		}
		array.push(pp);
		await findTransactions(newChannel,array);
	}
	
	return array;
}

export  {
	init,
	send,
	fetch
}