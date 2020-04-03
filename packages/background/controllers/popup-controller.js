import extensionizer from 'extensionizer'

class PopupController {
  constructor() {
    this.popup = false

    extensionizer.runtime.onConnect.addListener(port => {
      port.onDisconnect.addListener(() => {
        this.popup = null
      })
    })
  }

  setPopup(_popup) {
    this.popup = _popup
  }

  getPopup() {
    return this.popup
  }

  async openPopup() {
    if (this.popup && this.popup.closed) this.popup = false

    if (this.popup && (await this.updatePopup())) return

    if (typeof chrome !== 'undefined') {
      return extensionizer.windows.create(
        {
          url: 'packages/popup/build/index.html',
          type: 'popup',
          width: 380,
          height: 620,
          left: 25,
          top: 25
        },
        window => {
          this.popup = window
        }
      )
    }

    this.popup = await extensionizer.windows.create({
      url: 'packages/popup/build/index.html',
      type: 'popup',
      width: 380,
      height: 620,
      left: 25,
      top: 25
    })
  }

  closePopup() {
    if (!this.popup) return

    extensionizer.windows.remove(this.popup.id)
    this.popup = false
  }

  updatePopup() {
    return new Promise(resolve => {
      if (typeof chrome !== 'undefined') {
        return extensionizer.windows.update(
          this.popup.id,
          { focused: true },
          window => {
            resolve(Boolean(window))
          }
        )
      }

      extensionizer.windows
        .update(this.popup.id, {
          focused: true
        })
        .then(resolve)
        .catch(() => resolve(false))
    })
  }
}

export default PopupController
