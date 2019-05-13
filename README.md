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
yarn build:popup
```

if you want to build background, contentScript and lib

```
yarn build:core
```


After having built the application, it needs to be loaded on chrome.

## How to install Chrome extensions manually

* Go to chrome://extensions/ and check the box for Developer mode in the top right.
* Click the Load unpacked extension button and select the build folder for your extension to install it.


## In development : iotaJs injection.


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

## List of Supported injected functions

### getNodeInfo(callback)

| Param | Type | Description |
| --- | --- | --- |
| callback | <code>function</code> | callback |



### prepareTransfers(transfers,callback)

| Param | Type | Default | Description |
| --- | --- | --- | --- |
| transfers | <code>object</code> |  |  |
| [options] | <code>object</code> |  |  |
| [options.inputs] | <code>Array.&lt;Input&gt;</code> |  | Inputs used for signing. Needs to have correct security, keyIndex and address value |
| [options.inputs[].address] | <code>Hash</code> |  | Input address trytes |
| [options.inputs[].keyIndex] | <code>number</code> |  | Key index at which address was generated |
| [options.inputs[].security] | <code>number</code> | <code>2</code> | Security level |
| [options.inputs[].balance] | <code>number</code> |  | Balance in iotas |
| [options.address] | <code>Hash</code> |  | Remainder address |
| [options.security] | <code>Number</code> |  | Security level to be used for getting inputs and reminder address |
| callback | <code>function</code> |  | callback |

