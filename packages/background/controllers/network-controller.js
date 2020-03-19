import logger from '@pegasus/utils/logger'
import { EventEmitter } from 'eventemitter3'

class NetworkController extends EventEmitter {
  constructor(configs) {
    super()

    const { stateStorageController, customizatorController } = configs

    this.stateStorageController = stateStorageController
    this.customizatorController = customizatorController
  }

  setWalletController(_walletController) {
    this.walletController = _walletController
  }

  setCurrentNetwork(_network) {
    try {
      this.stateStorageController.set('selectedNetwork', _network)

      this.emit('providerChanged', _network.provider)

      logger.log(
        `(NetworkController) New selected provider ${_network.provider}`
      )
    } catch (err) {
      throw new Error(err)
    }
  }

  getCurrentNetwork() {
    return this.stateStorageController.get('selectedNetwork')
  }

  getAllNetworks() {
    return this.stateStorageController.get('networks')
  }

  addNetwork(_network) {
    // TODO check that the name does not exists
    try {
      const networks = this.stateStorageController.get('networks')

      networks.push(_network)
      this.stateStorageController.set('networks', networks)

      this.emit('providerChanged', _network.provider)

      logger.log(`(NetworkController) New provider added ${_network.provider}`)
    } catch (err) {
      throw new Error(err)
    }
  }

  deleteCurrentNetwork() {
    try {
      let networks = this.stateStorageController.get('networks')
      const currentNetwork = this.stateStorageController.get('selectedNetwork')

      networks = configs.networks.filter(
        network => currentNetwork.name !== network.name
      )

      const selectedNetwork = configs.networks[0]

      this.stateStorageController.set('networks', networks)
      this.stateStorageController.set('selectedNetwork', selectedNetwork)

      this.emit('providerChanged', selectedNetwork.provider)

      logger.log(
        `(NetworkController) Deleted provider ${currentNetwork.provider}`
      )

      return currentNetwork
    } catch (err) {
      throw new Error(err)
    }
  }
}

export default NetworkController
