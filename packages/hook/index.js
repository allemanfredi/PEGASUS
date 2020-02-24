import PegasusConnector from './pegasus-connector'
import EventChannel from '@pegasus/utils/event-channel'
import PegasusCustomizator from './pegasus-customizator'

const eventChannel = new EventChannel('pageHook')
const pegasusConnector = new PegasusConnector(eventChannel)
const pegasusCustomizator = new PegasusCustomizator({
  pegasusConnector,
  eventChannel
})

const proxiedPegasusCustomizator = new Proxy(pegasusCustomizator, {
  deleteProperty: () => true
})

window.iota = proxiedPegasusCustomizator
