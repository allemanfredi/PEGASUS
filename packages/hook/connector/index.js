import Utils from '@pegasus/lib/utils'

const connector = {

  init(request) {
    this.request = request
    window.iota.connect = (...args) => this._connect(args)
  },

  _connect(args) {
    const cb = args[0]
    const origin = this.getOrigin()
    if(!cb) {
      return Utils.injectPromise(this.request, 'connect', { origin })
    }
    this.request('connect', { origin })
      .then(r => cb(r, null))
      .catch(err => cb(null, err))
  },

  getOrigin() {
    return location.origin
  }
}

export default connector