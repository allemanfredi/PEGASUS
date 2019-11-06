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
```

```
yarn build
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
    //grant permission
    const permission = await window.iota.connect()

    //if user enabled
    if (permission.connected) {
        const bundle = await window.iota.prepareTransfers(transfers)
        console.log(bundle)
    } 
}
```
&nbsp;
### :page_with_curl: List of Supported injected functions

It's possible to interact with the functions both with __callbacks__ and __promises__
 * .connect([callback])
 * .addNeighbors(uris, [callback])
 * .attachToTangle(trunkTransaction, branchTransaction, minWeightMagnitude, trytes, [callback])
 * .broadcastBundle(tailTransactionHash, [callback])
 * .broadcastTransactions(trytes, [callback])
 * .checkConsistency(transactions, [options], [callback])
 * .getNodeInfo([callback])
 * .prepareTransfers(seed, transfers, [options], [callback])
 * .findTransactionObjects(query, [callback])
 * .findTransactions(query, [callback])
 * .getBalances(addresses, threshold, [callback])
 * .getBundle(tailTransactionHash, [callback])
 * .getInclusionStates(transactions, tips, [callback])
 * .getLatestInclusion(transactions, tips, [callback])
 * .getNeighbors([callback])
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

__getAccountData__, __getInputs__, __getNewAddress__ have been disabled for security reason.

&nbsp;

***

&nbsp;

## :hammer: Work In Progress
* __`pegasus-ledger-trampoline`__: Since it is not possible to access Ledger Nano S from a Google Chrome extension, i implemented a workaround: injecting an iframe to the background page of the extension, (which is hosted thanks to __gh-pages__ [here](https://github.com/allemanfredi/pegasus-ledger-trampoline/tree/master)). In order to work correctly, the iframe must run under https (since U2F requires SSL). [30%]


