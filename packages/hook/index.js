import PegasusConnector from './pegasus-connector'
import EventChannel from '@pegasus/utils/event-channel'
import PegasusCustomizator from './pegasus-customizator'

const start = async () => {
  const eventChannel = new EventChannel('pageHook')
  const pegasusConnector = new PegasusConnector(eventChannel)
  const pegasusCustomizator = new PegasusCustomizator({
    pegasusConnector,
    eventChannel
  })

  eventChannel.on(
    'setProvider',
    provider => (window.iota = pegasusCustomizator.getCustomIota(provider))
  )

  const { selectedProvider } = await pegasusConnector.send('init')
  window.iota = pegasusCustomizator.getCustomIota(selectedProvider)
  console.log('Pegasus injected iotajs succesfully')
}

start()
