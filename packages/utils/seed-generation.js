import crypto from 'crypto'

const byteToChar = trit => {
  return '9ABCDEFGHIJKLMNOPQRSTUVWXYZ'.charAt(trit % 27)
}

const randomBytes = (_size, _max) => {
  if (_size !== parseInt(_size, 10) || _size < 0) return false

  const bytes = crypto.randomBytes(_size)

  for (let i = 0; i < bytes.length; i++)
    while (bytes[i] >= 256 - (256 % _max)) bytes[i] = randomBytes(1, _max)[0]

  return Array.from(bytes)
}

const generateSeed = (_length = 81) => {
  const bytes = randomBytes(_length, 27)
  const seed = bytes.map(byte => byteToChar(byte))
  return seed
}

export { generateSeed }
