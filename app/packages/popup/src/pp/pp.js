
/*const {iotaInit,getNewAddress,prepareTransfer,findTransactionObject} = require('../core/core');
const { trytesToAscii } = require('@iota/converter')

let seed;

const init = async (provider,channelSeed) => {
	return new Promise( async (resolve,reject) => {

		iotaInit(provider);
		seed = channelSeed;

		const channel = await getNewAddress(seed);
		const state =  {
			nextChannel : channel,
			count : 0
		}
		resolve(state);
	});
}

const send = async (state,message) => {
	return new Promise (async (resolve,reject) => {
		const newChannel = await getNewAddress(seed);
		const newState = {
			nextChannel : newChannel,
			count : state.count + 1
		}
		const pp = {
			state : newState,
			message : message
		}
		const transfer = {
			seed : seed,
			to : state.nextChannel,
			value : 0,
			message : pp,
			tag : "pegasus",
			difficulty : 9 //for now testnet
		}
		prepareTransfer( transfer , async (bundle,error) => {
			resolve(newState);
		});
	});
}

const fetch = async channel => {

	let array = [];
	const res = await findTransactions(channel,array);
	return res;
}

const findTransactions = async (channel,array) => {

	const options = {addresses : [channel]}
	const transactions = await findTransactionObject(options);

	let currentTransaction;
	array.length > 0 ? currentTransaction = array[array.length-1].transaction : currentTransaction = null;

	if ( transactions.length !== 0 && currentTransaction !== transactions[0].hash){
		const data = trytesToAscii(transactions[0].signatureMessageFragment.substring(0,transactions[0].signatureMessageFragment.length-1));
		const newData = JSON.parse(data.replace(/\0.*$/g,''));
		const obj = {
			data : newData,
			transaction : transactions[0].hash
		}
		array.push(obj);
		array = await findTransactions(newData.state.nextChannel,array);
	}
	return array;
}

export  {
	init,
	send,
	fetch
}*/