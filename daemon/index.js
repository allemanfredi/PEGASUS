
const {iotaInit,generateSeed,getAccountData,findTransactionObject,prepareTransfer,getInputs,getMessage} = require('./src/iota.js');
const {trytesToAscii} = require('@iota/converter');
const {generateKeys,encryptWithRsaPublicKey} = require('./src/crypto');
const fs = require('fs');
const NodeRSA = require('node-rsa');

const {init,fetch,publish,changeMode} = require('./src/mam');


const deviceName = 'device-vale12';
const lat = 41;
const lon = 8;
const price = 3;
const description = "weather sensor"

const provider = 'https://nodes.devnet.iota.org';//'https://nodes.thetangle.org:443';
const difficulty = 9;
const tag = "pegasusv10g"; //"pegasusv10";

let publicState;
let seed;
let publicSeed;

let restrictedSeed;
let restrictedState;

let data = {};

const mode = 'restricted'
const secretKey = 'VERYSECRETKEY'


const initialize = async () => {

	//IOTA INITIALIZATION
	console.log("start initialization ...");
	iotaInit(provider);

	if (fs.existsSync('param.json')) {
		console.log("daemon initialied with param.json with the following parameters");
		const fileContents = await fs.promises.readFile('param.json');
    data = JSON.parse(fileContents);
		console.log(data);
		if ( !data.sentInfo ){
			await sendInfo();
			data.sentInfo = true;
			fs.writeFileSync('param.json', JSON.stringify(data), null);
		}
		await init(provider,data.channel.state.seed);
		return;
	}

	const bufSeed = generateSeed();
	seed = bufSeed.toString().replace(/,/g, '');
	console.log('account seed : ' + seed );

	//MAM INITIALIZATION
	const bufRestricted = generateSeed();
	restrictedSeed = bufRestricted.toString().replace(/,/g, '');
	restrictedState = await init(provider,restrictedSeed);
	restrictedState = changeMode(restrictedState, mode, secretKey);

	//save settings
	data = {
		seed : seed,
		device : {
			name : deviceName,
			lat : lat,
			lon : lon,
			price : price,
			description : description
		},
		channel : {
			state : restrictedState
		},
		processed : [],
		sentInfo : false
	}
	fs.writeFileSync('param.json', JSON.stringify(data), null);

	//send the coordinate in order to properly be displayed on the map in PEGASUS-CLIENT
	sendInfo(() => {
		data.sentInfo = true;
		fs.writeFileSync('param.json', JSON.stringify(data), null);
	});

	return;
}


const sendInfo = async callback => {

	//device send the message into the public channel in order to be seen
	const account = await getAccountData(data.seed);
	const publicMessage = {
		name : data.device.name,
		address : account.latestAddress, // in order to receive payments
		lat : data.device.lat,
		lon : data.device.lon,
		price : data.device.price,
		description : data.device.description
	}

	//genero un seed in maniera da compiere una tx sul tangle all'indirizzo di questo seed appena generato
	const bufRandomSeed = generateSeed();
	const randomSeed = bufRandomSeed.toString().replace(/,/g, '');
	const to = await getAccountData(randomSeed);

	const transfer = {
		seed : data.seed,
		to : to.latestAddress,
		value : 0,
		message : publicMessage,
		tag : tag,
		difficulty : difficulty //testnet
	}
	prepareTransfer(transfer , (bundle,error) => {
		if (bundle){
			callback();
			console.log("device succesfully comunicate its details " + bundle);
		}
	});
}

const payments = async () => {
		const account = await getAccountData(data.seed);

		//get tx to this device with the tag XXXX
		const options = {addresses : account.addresses};
		const transactions = await findTransactionObject(options);

		for ( let transaction of transactions ){
			if ( transaction.currentIndex === 0 && !data.processed.includes(transaction.hash) && transaction.value === data.device.price){
				try{
						const message = await getMessage(transaction.hash);
						console.log(message);
						if ( message.address && message.publicKey ){

							console.log("received public key");
							console.log(message.publicKey);

							const keyMessage = {
								sidekey : encrypt(message.publicKey,secretKey),
								root : encrypt(message.publicKey,data.channel.state.channel.next_root),
								deviceName : data.device.name,
								description : data.device.description
							}
							console.log("encrypted message");
							console.log(keyMessage);

							const transfer = {
								seed : data.seed,
								to : message.address,
								value : 0,
								message : keyMessage,
								tag : tag,
								difficulty : difficulty //testnet
							}

							prepareTransfer(transfer , (bundle,error) => {
								if ( error ){
									console.log(error);
								}
								if (bundle){
									console.log("device succesfully comunicate send " + bundle + " at address " + message.address);

									data.processed.push(transaction.hash);
									fs.writeFileSync('param.json', JSON.stringify(data), null);
								}
							});
						}
				}catch(err){
					console.log(err);
				}
			}
		}
}

const publishData = async packet => {
		const msg = await publish(packet,data.channel.state);
		data.channel.state = msg.state;
		fs.writeFileSync('param.json', JSON.stringify(data), null);
		return;
}


const encrypt = (publicKey,message) => {
	const key = new NodeRSA();
	key.importKey(publicKey,'pkcs8-public');
	return key.encrypt(message,'base64');
}

const main = async () => {
	try{
		await initialize();
		await payments();
		await publishData({
			data:10,
			timestamp : Date.now()
		});

		setInterval ( () => {
			payments();
		},20000);


		setInterval ( () => {
			publishData({
				data:10,
				timestamp : Date.now()
			});
		},20000);
	}catch(err){
			console.log(err);
	}
}
main();
