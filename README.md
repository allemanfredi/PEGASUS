![Alt text](packages/popup/public/material/logo/pegasus-64.png?raw=true "Title")
# PEGASUS
 Pegasus is a chrome extension that implements a wallet for the IOTA cryptocurrency. In addition, Pegasus injects the iotajs library allowing developers to interact with IOTA ecosystem without paying attention on how to keep the seed safe.


### Installing

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
yarn build:react
```


After having built the application, it needs to be loaded on chrome.

## How to install Chrome extensions manually

* Go to chrome://extensions/ and check the box for Developer mode in the top right.
* Click the Load unpacked extension button and select the build folder for your extension to install it.


## In development

iotaJs injection. 


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

    iotajs.prepareTransfers(transfers , (bundle,err) => {
        if (!err){
            console.log(bundle);
        }
    });
}
```

