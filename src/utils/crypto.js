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




export {aes256encrypt,aes256decrypt,sha256};

