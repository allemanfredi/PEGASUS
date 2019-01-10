const Curl = require('@iota/curl').default
const converter = require('@iota/converter')

function trinarySum(a, b) {
    const result = a + b
    return result == 2 ? -1 : result == -2 ? 1 : result
}

function increment(subseed, count) {
    let index = count == null || count < 1 ? 1 : count
    while (index-- > 0) {
        for (let j = 0; j < 243; j++) {
            if (++subseed[j] > 1) {
                subseed[j] = -1
            } else {
                break
            }
        }
    }
    return subseed
}

function hash(rounds, ...keys) {
    const curl = new Curl(rounds)
    const key = new Int8Array(Curl.HASH_LENGTH)
    curl.initialize()
    keys.map(k => curl.absorb(k, 0, Curl.HASH_LENGTH))
    curl.squeeze(key, 0, Curl.HASH_LENGTH)
    return key
}

function encrypt(message, key, salt) {
    const curl = new Curl()
    curl.initialize()
    curl.absorb(converter.trits(key), 0, key.length)
    if (salt != null) {
        curl.absorb(converter.trits(salt), 0, salt.length)
    }
    const length = message.length * 3
    const outTrits = new Int32Array(length)
    const intermediateKey = new Int32Array(curl.HASH_LENGTH)
    return message
        .match(/.{1,81}/g)
        .map(m => {
            curl.squeeze(intermediateKey, 0, curl.HASH_LENGTH)
            const out = converter.trytes(
                converter
                    .trits(m)
                    .map((t, i) => trinarySum(t, intermediateKey[i]))
            )
            return out
        })
        .join('')
}

function decrypt(message, key, salt) {
    const curl = new Curl()
    curl.initialize()
    curl.absorb(converter.trits(key), 0, key.length)
    if (salt != null) {
        curl.absorb(converter.trits(salt), 0, salt.length)
    }
    const messageTrits = converter.trits(message)
    const length = messageTrits.length
    const plainTrits = new Int32Array(length)
    const intermediateKey = new Int32Array(curl.HASH_LENGTH)
    return message
        .match(/.{1,81}/g)
        .map(m => {
            curl.squeeze(intermediateKey, 0, curl.HASH_LENGTH)
            const out = converter.trytes(
                converter
                    .trits(m)
                    .map((t, i) => trinarySum(t, -intermediateKey[i]))
            )
            return out
        })
        .join('')
}

module.exports = {
    encrypt,
    decrypt,
    increment,
    hash
}