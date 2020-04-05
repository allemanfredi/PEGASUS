// taken from here https://github.com/kumavis/web3-stream-provider/blob/master/index.js and adapted for my scope
import { Duplex } from 'readable-stream'
import { inherits } from 'util'
import { v4 as uuidv4 } from 'uuid'

function StreamProvider() {
  Duplex.call(this, {
    objectMode: true
  })

  this._payloads = {}
}

inherits(StreamProvider, Duplex)

// util

function noop() {}

StreamProvider.prototype.send = function(payload, callback) {
  // remap uuid to prevent duplicates
  const originalId = payload.uuid
  const uuid = uuidv4()
  payload.uuid = uuid

  // handle batch requests
  if (Array.isArray(payload)) {
    // short circuit for empty batch requests
    if (payload.length === 0) return callback(null, [])
  }

  // store request details
  this._payloads[uuid] = [callback, originalId]

  this.push(payload)
}

StreamProvider.prototype.isConnected = function() {
  return true
}

// private

StreamProvider.prototype._onResponse = function(response) {
  const uuid = response.uuid

  const data = this._payloads[uuid]
  if (!data) {
    throw new Error(
      `StreamProvider - Unknown response uuid for response: ${response}`
    )
  }

  delete this._payloads[uuid]
  const callback = data[0]
  response.uuid = data[1] // restore original uuid

  // run callback on empty stack,
  // prevent internal stream-handler from catching errors
  setTimeout(function() {
    callback(null, response)
  })
}

// stream plumbing

StreamProvider.prototype._read = noop

StreamProvider.prototype._write = function(msg, encoding, cb) {
  this._onResponse(msg)
  cb()
}

export default StreamProvider
