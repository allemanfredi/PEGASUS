![Alt text](app/package/popup/public/material/logo/pegasus-64.png?raw=true "Title")
# PEGASUS
 Pegasus is a chrome extension that implements a wallet for the IOTA cryptocurrency. In addition to being a wallet, Pegasus will implement a sort of marketplace where a user can buy streams of data coming from sensors connected to the IOTA network through the MAM protocol (Masked Authentication Message).

### Installing

```
git clone https://github.com/allemanfredi/PEGASUS.git
```

```
cd PEGASUS/app
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


## Run Daemon


```
cd PEGASUS/daemon
```

```
npm install
```

```
node index.js deviceName latitude longitude price description
```




