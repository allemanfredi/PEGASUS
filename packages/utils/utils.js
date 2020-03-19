import crypto from 'crypto'
import { addChecksum, isValidChecksum } from '@iota/checksum'

const Utils = {
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
    return crypto
      .createHash('sha256')
      .update(text)
      .digest('hex')
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
    return `${hours}:${minutes.substr(-2)}:${seconds.substr(
      -2
    )} - ${tomonth}/${todate}/${toyear}`
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
    const values = [
      '9',
      'A',
      'B',
      'C',
      'D',
      'E',
      'F',
      'G',
      'H',
      'I',
      'J',
      'K',
      'L',
      'M',
      'N',
      'O',
      'P',
      'Q',
      'R',
      'S',
      'T',
      'U',
      'V',
      'W',
      'X',
      'Y',
      'Z'
    ]
    if (address.length !== 81 && address.length != 90) return false
    ;[...address].forEach(c => {
      if (values.indexOf(c) === -1) return false
    })
    return true
  },

  isValidSeed(seed) {
    const values = [
      '9',
      'A',
      'B',
      'C',
      'D',
      'E',
      'F',
      'G',
      'H',
      'I',
      'J',
      'K',
      'L',
      'M',
      'N',
      'O',
      'P',
      'Q',
      'R',
      'S',
      'T',
      'U',
      'V',
      'W',
      'X',
      'Y',
      'Z'
    ]
    if (seed.length !== 81) return false
    ;[...seed].forEach(c => {
      if (values.indexOf(c) === -1) return false
    })
    return true
  },

  sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms))
  },

  checksummed(address) {
    return addChecksum(address)
  },

  isChecksummed(address) {
    return isValidChecksum(address)
  },

  showAddress(address, limitStart, limitEnd) {
    return `${address.slice(0, limitStart)}...${address.slice(
      address.length - limitEnd,
      address.length
    )}`
  },

  copyObject(obj) {
    return JSON.parse(JSON.stringify(obj))
  },

  isEmptyObject(obj) {
    return Object.entries(obj).length === 0 && obj.constructor === Object
  },

  isObject(obj) {
    return typeof obj === 'object'
  },

  isError(error) {
    return error && error.stack && error.message
  },

  isURL(str) {
    const expression = /(https?:\/\/(?:www\.|(?!www))[a-zA-Z0-9][a-zA-Z0-9-]+[a-zA-Z0-9]\.[^\s]{2,}|www\.[a-zA-Z0-9][a-zA-Z0-9-]+[a-zA-Z0-9]\.[^\s]{2,}|https?:\/\/(?:www\.|(?!www))[a-zA-Z0-9]+\.[^\s]{2,}|www\.[a-zA-Z0-9]+\.[^\s]{2,})/gi
    const regex = new RegExp(expression)
    return regex.test(str)
  }
}

export default Utils
