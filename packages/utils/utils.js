import crypto from 'crypto'
import { addChecksum, isValidChecksum } from '@iota/checksum'

const Utils = {

  requestHandler(target) {
    return new Proxy(target, {
      get(target, prop) {
        if (!Reflect.has(target, prop))
          throw new Error(`Object does not have property '${prop}'`)

        if (typeof target[prop] !== 'function' || prop === 'on')
          return Reflect.get(target, prop)

        return (...args) => {

          if (!args.length)
            args[0] = {}
          
          const [firstArg] = args

          const {
            resolve = () => { },
            reject = ex => console.error(ex),
            data
          } = firstArg

          if (typeof firstArg !== 'object' || !('data' in firstArg))
            return target[prop].call(target, ...args)

          Promise.resolve(target[prop].call(target, data))
            .then(resolve)
            .catch(reject)
        }
      }
    })
  },

  injectPromise(func, ...args) {
    return new Promise((resolve, reject) => {
      func(...args)
        .then(res => resolve(res))
        .catch(err => reject(err))
    })
  },

  isFunction(obj) {
    return typeof obj === 'function'
  },

  sha256(text) {
    return crypto.createHash('sha256').update(text).digest('hex')
  },

  randomBytes(size, max) {
    if (size !== parseInt(size, 10) || size < 0)
      return false

    const bytes = crypto.randomBytes(size)

    for (let i = 0; i < bytes.length; i++) {
      while (bytes[i] >= 256 - 256 % max)
        bytes[i] = this.randomBytes(1, max)[0]
    }

    return Array.from(bytes)
  },

  byteToChar(trit) {
    return '9ABCDEFGHIJKLMNOPQRSTUVWXYZ'.charAt(trit % 27)
  },

  charToByte(char) {
    return '9ABCDEFGHIJKLMNOPQRSTUVWXYZ'.indexOf(char.toUpperCase())
  },

  timestampToDate(timestamp) {
    const date = new Date(timestamp)
    const todate = date.getDate()
    const tomonth = date.getMonth() + 1
    const toyear = date.getFullYear()
    return `${tomonth}/${todate}/${toyear}`
  },

  timestampToDateMilliseconds(timestamp) {
    const date = new Date(timestamp)
    const todate = date.getDate()
    const tomonth = date.getMonth() + 1
    const toyear = date.getFullYear()
    const hours = date.getHours()
    const minutes = `0${date.getMinutes()}`
    const seconds = `0${date.getSeconds()}`
    return `${hours}:${minutes.substr(-2)}:${seconds.substr(-2)} - ${tomonth}/${todate}/${toyear}`
  },

  aes256encrypt(text, key) {
    const cipher = crypto.createCipher('aes-256-ctr', key)
    let crypted = cipher.update(text, 'utf8', 'hex')
    crypted += cipher.final('hex')
    return crypted
  },

  aes256decrypt(text, key) {
    const decipher = crypto.createDecipher('aes-256-ctr', key)
    let dec = decipher.update(text, 'hex', 'utf8')
    dec += decipher.final('utf8')
    return dec
  },

  iotaReducer(amount) {
    if (amount < Math.pow(10, 3)) {
      const num = amount
      if (num % 1 !== 0) return num.toFixed(2) + 'i'
      return num + 'i'
    } else if (amount < Math.pow(10, 6)) {
      const num = amount / Math.pow(10, 3)
      if (num % 1 !== 0) return num.toFixed(2) + 'Ki'
      return num + 'Ki'
    } else if (amount < Math.pow(10, 9)) {
      const num = amount / Math.pow(10, 6)
      if (num % 1 !== 0) return num.toFixed(2) + 'Mi'
      return num + 'Mi'
    } else if (amount < Math.pow(10, 12)) {
      const num = amount / Math.pow(10, 9)
      if (num % 1 !== 0) return num.toFixed(2) + 'Gi'
      return num + 'Gi'
    } else if (amount < Math.pow(10, 15)) {
      const num = amount / Math.pow(10, 12)
      if (num % 1 !== 0) return num.toFixed(2) + 'Ti'
      return num + 'Ti'
    }
  },

  isValidAddress(address) {
    const values = ['9', 'A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z']
    if (address.length !== 81 && address.length != 90)
      return false;
    [...address].forEach(c => {
      if (values.indexOf(c) === -1)
        return false
    })
    return true
  },

  sleep(ms) {
    return new Promise(resolve =>
      setTimeout(resolve, ms)
    )
  },

  checksummed(address) {
    return addChecksum(address)
  },

  isChecksummed(address) {
    return isValidChecksum(address)
  },

  showAddress(address, limitStart, limitEnd) {
    return `${address.slice(0, limitStart)}...${address.slice(address.length - limitEnd, address.length)}`
  },

  copyObject (obj) {
    return JSON.parse(JSON.stringify(obj))
  },

  isEmptyObject (obj) {
    return Object.entries(obj).length === 0 && obj.constructor === Object
  }

}

export default Utils
