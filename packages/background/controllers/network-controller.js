import { backgroundMessanger } from '@pegasus/utils/messangers'

class NetworkController {

  constructor (options) {

    const {
      storageController,
      customizatorController
    } = options

    this.storageController = storageController
    this.customizatorController = customizatorController
  }

  setCurrentNetwork (network) {
    try {
      const options = this.storageController.getOptions()
      options.selectedNetwork = network
      this.storageController.setOptions(options)

      // change pagehook
      backgroundMessanger.setProvider(network.provider)
      backgroundMessanger.setNetwork(network)

      this.customizatorController.setProvider(network.provider)
    } catch (err) {
      throw new Error(err)
    }
  }

  getCurrentNetwork () {
    try {
      const options = this.storageController.getOptions()
      if (!options || !options.selectedNetwork) {
        this.storageController.setOptions({})
        return {}
      }
      return options.selectedNetwork
    } catch (err) {
      return {}
    }
  }

  getAllNetworks () {
    try {
      const options = this.storageController.getOptions()
      if (!options) {
        this.storageController.setOptions({})
        return {}
      }
      return options.networks
    } catch (err) {
      throw new Error(err)
    }
  }

  addNetwork (network) {
    // TODO check that the name does not exists
    try {
      const options = this.storageController.getOptions()
      if (!options.networks)
        options.networks = []

      options.networks.push(network)
      this.storageController.setOptions(options)

      backgroundMessanger.setNetworks(options.networks)
    } catch (err) {
      throw new Error(err)
    }
  }

  deleteCurrentNetwork () {
    try {
      const options = this.storageController.getOptions()
      const currentNetwork = options.selectedNetwork

      const networks = options.networks.filter(network => currentNetwork.name !== network.name)
      options.networks = networks

      // set the first network with the same type (mainnet/testnet)
      const selectedNetwork = options.networks[0]
      options.selectedNetwork = selectedNetwork

      this.storageController.setOptions(options)

      backgroundMessanger.setNetworks(options.networks)
      backgroundMessanger.setNetwork(selectedNetwork)
      backgroundMessanger.setProvider(selectedNetwork.provider)

      return currentNetwork
    } catch (err) {
      throw new Error(err)
    }
  }

}

export default NetworkController