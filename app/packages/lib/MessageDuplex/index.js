import Host from './handlers/host';
import Child from './handlers/child';

const Tab = Child.bind(null, 'tab');
const Popup = Child.bind(null, 'popup');

export default {
    Host,
    Tab,
    Popup
};