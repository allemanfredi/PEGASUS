import Host from './host'
import Child from './child'

const Tab = Child.bind(null, 'tab')
const Popup = Child.bind(null, 'popup')

export default {
  Host,
  Tab,
  Popup
}
