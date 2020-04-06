import argon2 from 'argon2-browser'
import {
  utf8ToBuffer,
  bufferToUtf8,
  bufferToBase64,
  base64ToBuffer
} from 'browserify-unibabel'

const TIME = 9
const MEMORY = 16384
const HASH_LENGTH = 32
const PARALLELISM = 2
const SALT_LENGTH = 16
const IV_LENGTH = 16

/**
 *
 * @param {String} _password
 * @param {Object} _dataObj
 */
const encrypt = async (_password, _dataObj) => {
  const salt = global.crypto.getRandomValues(new Uint8Array(SALT_LENGTH))

  const key = await argon2.hash({
    pass: _password,
    salt,
    time: TIME,
    mem: MEMORY,
    hashLen: HASH_LENGTH,
    parallelism: PARALLELISM,
    type: argon2.ArgonType.Argon2id,
    distPath: ''
  })

  const importedKey = await global.crypto.subtle.importKey(
    'raw',
    key.hash,
    {
      name: 'AES-GCM'
    },
    false,
    ['encrypt']
  )

  const data = JSON.stringify(_dataObj)
  const dataBuffer = utf8ToBuffer(data)
  const iv = global.crypto.getRandomValues(new Uint8Array(IV_LENGTH))

  const encryptedData = await global.crypto.subtle.encrypt(
    {
      name: 'AES-GCM',
      iv
    },
    importedKey,
    dataBuffer
  )

  return JSON.stringify({
    data: bufferToBase64(new Uint8Array(encryptedData)),
    iv: bufferToBase64(iv),
    salt: bufferToBase64(salt)
  })
}

/**
 *
 * @param {String} _password
 * @param {String} _text
 */
const decrypt = async (_password, _text) => {
  const payload = JSON.parse(_text)
  const salt = base64ToBuffer(payload.salt)

  const key = await argon2.hash({
    pass: _password,
    salt,
    time: TIME,
    mem: MEMORY,
    hashLen: HASH_LENGTH,
    parallelism: PARALLELISM,
    type: argon2.ArgonType.Argon2id,
    distPath: ''
  })

  const importedKey = await global.crypto.subtle.importKey(
    'raw',
    key.hash,
    {
      name: 'AES-GCM'
    },
    false,
    ['decrypt']
  )

  const encryptedData = base64ToBuffer(payload.data)
  const iv = base64ToBuffer(payload.iv)

  try {
    const decryptedData = await crypto.subtle.decrypt(
      {
        name: 'AES-GCM',
        iv
      },
      importedKey,
      encryptedData
    )

    return JSON.parse(bufferToUtf8(new Uint8Array(decryptedData)))
  } catch (err) {
    throw new Error('Invalid Password')
  }
}

export { encrypt, decrypt }
