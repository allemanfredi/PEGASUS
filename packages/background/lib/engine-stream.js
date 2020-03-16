//https://github.com/MetaMask/json-rpc-middleware-stream/blob/master/engineStream.js taken from here and adapted for my scope
import DuplexStream from 'readable-stream/duplex'

/**
 *
 * Handle request from a specific website tab
 *
 * @param {PegasusEngine} engine
 * @param {Object} website
 */
function createEngineStream(engine, website) {
  const stream = new DuplexStream({ objectMode: true, read, write })

  /*if (engine.on) {
    engine.on('notification', (message) => {
      stream.push(message)
    })
  }*/
  return stream

  function read() {
    return false
  }
  function write(request, encoding, cb) {
    engine.handle(
      Object.assign({}, request, {
        website,
        resolve: this.push
      })
    )
    cb()
  }
}
export default createEngineStream
