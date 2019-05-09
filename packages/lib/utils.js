import NodeRSA from 'node-rsa';
import crypto from 'crypto';

const Utils = {

    requestHandler(target) {
        return new Proxy(target, {
            get(target, prop) {
                
                if(!Reflect.has(target, prop))
                    throw new Error(`Object does not have property '${ prop }'`);

                if(typeof target[ prop ] !== 'function' || prop === 'on')
                    return Reflect.get(target, prop);

                return (...args) => {
                    if(!args.length)
                        args[ 0 ] = {};

                    const [ firstArg ] = args;

                    const {
                        resolve = () => {},
                        reject = ex => console.error(ex),
                        data
                    } = firstArg;

                    if(typeof firstArg !== 'object' || !('data' in firstArg))
                        return target[ prop ].call(target, ...args);

                    Promise.resolve(target[ prop ].call(target, data))
                        .then(resolve)
                        .catch(reject);
                };
            }
        });
    },

    injectPromise(func, ...args) {
        return new Promise((resolve, reject) => {
            func(...args, (err, res) => {
                if(err)
                    reject(err);
                else resolve(res);
            });
        });
    },

    isFunction(obj) {
        return typeof obj === 'function';
    },

    sha256(text){
        return crypto.createHash('sha256').update(text).digest('hex');
    },

    randomBytes(size, max){
        if (size !== parseInt(size, 10) || size < 0)
            return false;
    
        const bytes = crypto.randomBytes(size);
    
        for (let i = 0; i < bytes.length; i++) {
            while (bytes[ i ] >= 256 - 256 % max)
                bytes[ i ] = this.randomBytes(1, max)[ 0 ];
        }
    
        return Array.from(bytes);
    },

    byteToChar(trit){
        return '9ABCDEFGHIJKLMNOPQRSTUVWXYZ'.charAt(trit % 27);
    },

    charToByte(char){
        return '9ABCDEFGHIJKLMNOPQRSTUVWXYZ'.indexOf(char.toUpperCase());
    },

    byteToTrit(byte){
        return trytesTrits[ byte % 27 ];
    },

    bytesToTrits(bytes){
        let trits = [];
        for (let i = 0; i < bytes.length; i++)
            trits = trits.concat(byteToTrit(bytes[ i ]));
        return trits;
    },

    tritsToChars(trits){
        let seed = '';
        for (let i = 0; i < trits.length; i += 3) {
            const trit = trits.slice(i, i + 3).toString();
            for (let x = 0; x < tritStrings.length; x++) {
                if (tritStrings[ x ] === trit)
                    seed += '9ABCDEFGHIJKLMNOPQRSTUVWXYZ'.charAt(x);
            }
        }
        return seed;
    },

    timestampToDate(timestamp){
        const date = new Date(timestamp);
        const todate = date.getDate();
        const tomonth = date.getMonth() + 1;
        const toyear = date.getFullYear();
        return `${tomonth }/${ todate }/${ toyear}`;
    },

    timestampToDateMilliseconds(timestamp){
        const date = new Date(timestamp);
        const todate = date.getDate();
        const tomonth = date.getMonth() + 1;
        const toyear = date.getFullYear();
        const hours = date.getHours();
        const minutes = `0${ date.getMinutes()}`;
        const seconds = `0${ date.getSeconds()}`;
        return `${hours }:${ minutes.substr(-2) }:${ seconds.substr(-2) } - ${ tomonth }/${ todate }/${ toyear}`;
    },

    aes256encrypt(text, key){
        const cipher = crypto.createCipher('aes-256-ctr', key);
        let crypted = cipher.update(text, 'utf8', 'hex');
        crypted += cipher.final('hex');
        return crypted;
    },
    
    aes256decrypt(text, key){
        const decipher = crypto.createDecipher('aes-256-ctr', key);
        let dec = decipher.update(text, 'hex', 'utf8');
        dec += decipher.final('utf8');
        return dec;
    },

    generateKeys(){
        const key = new NodeRSA();
        key.generateKeyPair();
        const keys = {
            privateKey: key.exportKey('pkcs8-private'),
            publicKey: key.exportKey('pkcs8-public')
        };
        return keys;
    },

    iotaReducer(amount){
        if (amount < Math.pow(10, 3)) {
          const num = amount;
          if (num % 1 !== 0) return num.toFixed(2) + 'i';
          return num + 'i';
        } else if (amount < Math.pow(10, 6)) {
          const num = amount / Math.pow(10, 3);
          if (num % 1 !== 0) return num.toFixed(2) + 'Ki';
          return num + 'Ki';
        } else if (amount < Math.pow(10, 9)) {
          const num = amount / Math.pow(10, 6);
          if (num % 1 !== 0) return num.toFixed(2) + 'Mi';
          return num + 'Mi';
        } else if (amount < Math.pow(10, 12)) {
          const num = amount / Math.pow(10, 9);
          if (num % 1 !== 0) return num.toFixed(2) + 'Gi';
          return num + 'Gi';
        } else if (amount < Math.pow(10, 15)) {
          const num = amount / Math.pow(10, 12);
          if (num % 1 !== 0) return num.toFixed(2) + 'Ti';
          return num + 'Ti';
        }
      },
    
    
};

export default Utils;