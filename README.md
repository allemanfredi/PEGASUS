<img style="border-radius: 50%" src="./packages/popup/public/material/logo/pegasus-128.png" width="120" height="120">

# PEGASUS
 Pegasus is a chrome extension that implements a wallet for the IOTA cryptocurrency. In addition, Pegasus injects the iotajs library allowing developers to interact with IOTA Tangle without paying attention on how to keep the seed safe.

### :exclamation: Since Pegasus is still work in progress, there could be breaking changes!

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
yarn run init
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

The seed is saved in the local storage of the browser, encrypted (through __`argon2id + AES256-GCM`__) with the login password that a user chooses during the wallet initialization phase. To make it more difficult to find out, the password must meet the following requirements:

- Must contains at least 8 characters
- Must contains at least 1 uppercase character
- Must contains at least 1 lowercase character
- Must contains at least 1 symbol
- Must contains at least 1 digit

Of this password only its hash is saved in the local storage.

During the login phase, a user will have to enter a password, which will be compared with the hash (generated with __`argon2id`__) specified above. if the two hashes match (the password is correct), the wallet loads the seed from the local storage (encrypted with __`argon2id + AES256-GCM`__), decrypts it with the password just inserted and keeps it in memory together with the plain text of the password. If the wallet shows a period of inactivity of at least 60 minutes (modifiable), it will delete the value of the variables relating to seed and password. It is also possible to disable this feature from the settings page.
In this way, the seed decryption key is not saved anywhere except in the mind of the user or in the RAM for only a limited period of time.

A user also has the ability to export the seed, in order to do so, first he will have to enter the login password which will always be compared with the hash (of the password) saved in the local storage.
In this way, if a user loses the access password (or if he forgets it), if he has exported the seed he will be able to restore the wallet 

&nbsp;

***

&nbsp;

## :gear: Architecture


<img src="./images/architecture.png" width="900" height="500"/>

&nbsp;

***

&nbsp;

## :syringe: iota-js injection

```js
if (window.iota) {

    window.iota.on('providerChanged', provider => ...)
    window.iota.on('accountChanged', account => ...)

    // if you want to create a connection directly
    const isConnected = await window.iota.connect()
    
    const trytes = await window.iota.core.prepareTransfers(transfers)
    const bundle = await window.iota.core.sendTrytes(trytes, depth, minWeightMagnitude)

    // or
    const bundle = await window.iota.transfer(transfers)
}
```

&nbsp;

***

&nbsp;

## :hammer: Work In Progress

* __`pegasus-ledger-trampoline`__: Since it is not possible to access Ledger Nano S from a Google Chrome extension, i implemented a workaround: injecting an iframe to the background page of the extension, (which is hosted thanks to __gh-pages__ [here](https://github.com/allemanfredi/pegasus-ledger-trampoline/tree/master)). In order to work correctly, the iframe must run under https (since U2F requires SSL). [30%]

&nbsp;

***

&nbsp;

## :page_with_curl: Articles

* [Introduction to Pegasus: Seed Security](https://medium.com/@alessandromanfredi_46016/introduction-to-pegasus-seed-security-a9f25d68f28a)
* [Introduction to Pegasus: Architecture](https://medium.com/@alessandromanfredi_46016/introduction-to-pegasus-architecture-8fe70bcaed77)

&nbsp;

***

&nbsp;

## :rocket: Collaboration

### Code contributions are welcome!