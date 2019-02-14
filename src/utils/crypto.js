const NodeRSA = require('node-rsa');
const crypto = require('crypto');



/**
 * Encrypt plantext
 * @param {string} text - plantext
 * @param {string} key - key for ecryption
 * @returns {string} Encrypted content
 */
const aes256encrypt = (text,key) => {   
    const cipher = crypto.createCipher('aes-256-ctr',key);
    let crypted = cipher.update(text,'utf8','hex')
    crypted += cipher.final('hex');
    return crypted;
}


/**
 * Decrypt cyphertext
 * @param {string} text - cyphertex
 * @param {string} key - key for decryption
 * @returns {string} Decrypted content
 */
const aes256decrypt = (text,key) => {
    const decipher = crypto.createDecipher('aes-256-ctr',key)
    let dec = decipher.update(text,'hex','utf8')
    dec += decipher.final('utf8');
    return dec;
}


/**
 * Hash text using SHA-256
 * @param {string} text - Plain text to hash
 * @returns {string} SHA-256 hash
 */
const sha256 = (text) => {
  return crypto.createHash('sha256').update(text).digest('hex');
}

/**
 * Get random values 
 * @param {Integer} size - Size of the random array
 * @returns {Array} random bytes
 */
 const randomBytes = (size,max) => {
    if (size !== parseInt(size, 10) || size < 0) {
        return false;
    }

    const bytes = crypto.randomBytes(size);

    for (let i = 0; i < bytes.length; i++) {
        while (bytes[i] >= 256 - 256 % max) {
            bytes[i] = randomBytes(1, max)[0];
        }
    }

    return Array.from(bytes);
 }


 /**
 * Generate the asymmetric keys 
 * 
 * @returns {Object} containing the keys
 */
 const generateKeys = () => {
    const key = new NodeRSA();
    key.generateKeyPair();
    const publicKey = key.exportKey('pkcs8-public-der');
    const privateKey = key.exportKey('pkcs1-der');
    return { privateKey,publicKey};
 }

/**
 * Get random values 
 * @param {Object} toEcrypt - object to encrypt
 * @param {Uint32Array} publicKey - public key
 * @returns {String} encrypted text
 */
 const encryptWithRsaPublicKey = (toEncrypt, publicKey) => {
    const buffer = new Buffer(toEncrypt);
    const encrypted = crypto.publicEncrypt(publicKey, buffer);
    return encrypted.toString("base64");
};

/**
 * Get random values 
 * @param {Object} toDEcrypt - object to cencrypt
 * @param {Uint32Array} publicKey - private key
 * @returns {String} decrypted text
 */
const decryptWithRsaPrivateKey = (toDecrypt, privateKey) => {
    const buffer = new Buffer(toDecrypt, "base64");
    const decrypted = crypto.privateDecrypt(privateKey, buffer);
    return decrypted.toString("utf8");
};

 //https://stackoverflow.com/questions/8750780/encrypting-data-with-public-key-in-node-js

export {aes256encrypt,
        aes256decrypt,
        sha256,
        randomBytes,
        generateKeys,
        encryptWithRsaPublicKey,
        decryptWithRsaPrivateKey
    };

