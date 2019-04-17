import EventChannel from '@pegasus/lib/EventChannel';
import extensionizer from 'extensionizer';


const contentScript = {
    eventChannel: new EventChannel('contentScript'),

    init() {
        console.log('Initialising Pegasus');

        this.registerListeners();
        this.inject();
    },

    registerListeners() {
        this.eventChannel.on('tunnel', async data => {
            console.log(data);
        });
    },

    inject() {
        const injectionSite = (document.head || document.documentElement);
        const container = document.createElement('script');

        container.src = extensionizer.extension.getURL('dist/pageHook.js');
        container.onload = function() {
            this.parentNode.removeChild(this);
        };

        injectionSite.insertBefore(
            container,
            injectionSite.children[ 0 ]
        );

        console.log('Pegasus injected');
    }
};

contentScript.init();