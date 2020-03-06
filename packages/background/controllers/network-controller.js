import { backgroundMessanger } from '@pegasus/utils/messangers'

class NetworkController {
  constructor(configs) {
    const { stateStorageController, customizatorController } = configs

    this.stateStorageController = stateStorageController
    this.customizatorController = customizatorController
  }

  setWalletController(walletController) {
    this.walletController = walletController
  }

  setCurrentNetwork(network) {
    try {
      const configs = this.stateStorageController.get('configs')
      configs.selectedNetwork = network
      this.stateStorageController.set('configs', configs)

      backgroundMessanger.setSelectedProvider(network.provider)
      backgroundMessanger.setNetwork(network)
    } catch (err) {
      throw new Error(err)
    }
  }

  getCurrentNetwork() {
    const configs = this.stateStorageController.get('configs')
    return configs.selectedNetwork
  }

  getAllNetworks() {
    const configs = this.stateStorageController.get('configs')
    return configs.networks
  }

  addNetwork(network) {
    // TODO check that the name does not exists
    try {
      const configs = this.stateStorageController.get('configs')

      configs.networks.push(network)
      this.stateStorageController.set('configs', configs)

      backgroundMessanger.setNetworks(configs.networks)
    } catch (err) {
      throw new Error(err)
    }
  }

  deleteCurrentNetwork() {
    try {
      const configs = this.stateStorageController.get('configs')
      const currentNetwork = configs.selectedNetwork

      const networks = configs.networks.filter(
        network => currentNetwork.name !== network.name
      )
      configs.networks = networks

      // set the first network with the same type (mainnet/testnet)
      const selectedNetwork = configs.networks[0]
      configs.selectedNetwork = selectedNetwork

      this.stateStorageController.set('configs', configs)

      backgroundMessanger.setNetworks(configs.networks)
      backgroundMessanger.setNetwork(selectedNetwork)

      backgroundMessanger.setSelectedProvider(selectedNetwork.provider)

      return currentNetwork
    } catch (err) {
      throw new Error(err)
    }
  }
}

export default NetworkController
