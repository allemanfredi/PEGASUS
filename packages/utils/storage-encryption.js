import argon2 from 'argon2-browser'
import Unibabel from 'browserify-unibabel'
import crypto from 'crypto'

const TIME = 9
const MEMORY = 16384
const HASH_LENGTH = 32
const PARALLELISM = 2
const SALT_LENGTH = 16
const IV_LENGTH = 16

const encrypt = async (_password, _dataObj) => {
  const salt = crypto.randomBytes(SALT_LENGTH)

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

  const data = JSON.stringify(_dataObj)
  const initVector = crypto.randomBytes(IV_LENGTH)

  const cipher = crypto.createCipheriv(
    'aes-256-cbc',
    Buffer.from(key.hashHex, 'hex'),
    initVector
  )
  const encrypted = Buffer.concat([cipher.update(data), cipher.final()])

  return JSON.stringify({
    data: Unibabel.bufferToBase64(encrypted),
    iv: Unibabel.bufferToBase64(initVector),
    salt: Unibabel.bufferToBase64(salt)
  })
}

const decrypt = async (_password, _text) => {
  const payload = JSON.parse(_text)
  const salt = Unibabel.base64ToBuffer(payload.salt)

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

  const encryptedData = Unibabel.base64ToBuffer(payload.data)
  const initVector = Unibabel.base64ToBuffer(payload.iv)

  const decipher = crypto.createDecipheriv(
    'aes-256-cbc',
    Buffer.from(key.hashHex, 'hex'),
    initVector
  )
  const decrypted = Buffer.concat([
    decipher.update(Buffer.from(encryptedData)),
    decipher.final()
  ])

  return JSON.parse(decrypted.toString())
}

export { encrypt, decrypt }
