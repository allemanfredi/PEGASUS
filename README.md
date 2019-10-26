<img src="./packages/popup/public/material/logo/pegasus-128.png" width="80" height="80">

# PEGASUS
 Pegasus is a chrome extension that implements a wallet for the IOTA cryptocurrency. In addition, Pegasus injects the iotajs library allowing developers to interact with IOTA Tangle without paying attention on how to keep the seed safe.

&nbsp;

***

&nbsp;

### :zap: Installing

```
git clone https://github.com/allemanfredi/PEGASUS.git
```

```
cd PEGASUS
```

```
yarn install
lerna bootstrap
```

```
yarn build
```

If you want to build only the popup:

```
yarn build:popup
```

if you want to build background, contentScript and lib

```
yarn build:core
```

&nbsp;

***

&nbsp;
After having built the application, it needs to be loaded on chrome.

## :exclamation: How to install Chrome extensions manually

* Go to chrome://extensions/ and check the box for Developer mode in the top right.
* Click the Load unpacked extension button and select the build folder for your extension to install it.

&nbsp;

***

&nbsp;

## :seedling: How the seed is stored?

The seed is saved in the local storage of the browser, encrypted (through aes256) with the login password that a user chooses during the wallet initialization phase. To make it more difficult to find out, the password must meet the following requirements:

- Must contains at least 8 characters
- Must contains at least 1 uppercase character
- Must contains at least 1 lowercase character
- Must contains at least 1 symbol
- Must contains at least 1 digit

Of this password only its hash is saved in the local storage.

During the login phase, a user will have to enter a password, which will be compared with the hash specified above. if the two hashes match (the password is correct), the wallet loads the seed from the local storage (encrypted), decrypts it with the password just inserted and keeps it in memory together with the plain text of the password. If the wallet shows a period of inactivity of at least 15 minutes, delete the value of the variables relating to seed and password.
In this way, the seed decryption key is not saved anywhere except in the mind of the user or in the RAM for only a limited period of time.

A user also has the ability to export the seed, in order to do so, first he will have to enter the login password which will always be compared with the hash (of the password) saved in the local storage.
In this way, if a user loses the access password (or if he forgets it), if he has exported the seed he will be able to restore the wallet 

&nbsp;

***

&nbsp;

## :syringe: iota-js injection

```js
if (window.iota) {
    const iotajs = window.iota.iotajs;
    const selectedAddress = window.iota.selectedAddress
    
    const transfers = [{
        address: 'address here',
        value: 10, 
        tag: '', // optional tag of `0-27` trytes
        message: '' // optional message in trytes
    }];

    //callback
    iotajs.prepareTransfers(transfers , (bundle,err) => {
        if (!err){
            console.log(bundle);
        }
    });

    //async/await 
    const bundle = await iotajs.prepareTransfers(transfers);
    console.log(bundle)
}
```
&nbsp;
### :page_with_curl: List of Supported injected functions

It's possible to interact with the functions both with __callbacks__ and __promises__

 * .addNeighbors(uris, [callback])
 * .attachToTangle(trunkTransaction, branchTransaction, minWeightMagnitude, trytes, [callback])
 * .broadcastBundle(tailTransactionHash, [callback])
 * .broadcastTransactions(trytes, [callback])
 * .checkConsistency(transactions, [options], [callback])
 * .getNodeInfo([callback])
 * .prepareTransfers(seed, transfers, [options], [callback])
 * .findTransactionObjects(query, [callback])
 * .findTransactions(query, [callback])
 * .getAccountData(options, [callback])
 * .getBalances(addresses, threshold, [callback])
 * .getBundle(tailTransactionHash, [callback])
 * .getInclusionStates(transactions, tips, [callback])
 * .getInputs(seed, [options], [callback])
 * .getLatestInclusion(transactions, tips, [callback])
 * .getNeighbors([callback])
 * .getNewAddress(seed, [options], [callback])
 * .getNodeInfo([callback])
 * .getTips([callback])
 * .getTransactionObjects(hashes, [callback])
 * .getTransactionsToApprove(depth, [reference], [callback])
 * .getTrytes(hashes, [callback])
 * .isPromotable(tail, [callback])
 * .prepareTransfers(transfers, [options], [callback])
 * .promoteTransaction(tail, depth, minWeightMagnitude, transfer, [options], [callback])
 * .removeNeighbors(uris, [callback])
 * .replayBundle(tail, depth, minWeightMagnitude, [callback])
 * .sendTrytes(trytes, depth, minWeightMagnitude, [reference], [callback])
 * .storeAndBroadcast(trytes, [callback])
 * .storeTransactions(trytes, [callback])
 * .traverseBundle(trunkTransaction, [bundle], [callback])
 * .generateAddress(seed, index, [security], [checksum] , [callback])

&nbsp;

***

&nbsp;

## :camera: Some screenshots

__Iotajs injection__

<img src="./images/injection.png" width="400" height="500">

__Mam explorer__

<img src="./images/mam-explorer.png" width="320" height="500">

