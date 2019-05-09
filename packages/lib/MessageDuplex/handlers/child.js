import EventEmitter from 'eventemitter3';
import randomUUID from 'uuid/v4';
import extensionizer from 'extensionizer';


class MessageDuplexChild extends EventEmitter {
    constructor(type = false) {
        super();

        if(![ 'tab', 'popup' ].includes(type))
            throw new Error(`MessageDuplexChild expects a source type of either tab or popup, instead "${ type }" was provided`);

        this.type = type;
        this.incoming = new Map(); // Incoming message replies
        this.outgoing = new Map(); // Outgoing message replies
        this.messageListener = false;
        this.disconnectListener = false;
        this.extensionID = extensionizer.runtime.id;

        this.resetGovernor();
        this.connectToHost();
        this.connectionGovernor();
    }

    connectToHost() {
        this.channel = extensionizer.runtime.connect({
            name: this.type
        });

        this.governor.isConnected = true;

        this.messageListener = this.channel.onMessage.addListener(message => {
            this.handleMessage(message);
        });

        this.disconnectListener = this.channel.onDisconnect.addListener(() => {
            const error = (
                this.channel.error ||
                extensionizer.lastError ||
                'Unknown disconnect'
            );

            console.log('Lost connection to MessageDuplexHost:', error);

            this.governor.isConnected = false;
            this.governor.reconnect();
        });
    }

    resetGovernor() {
        if(this.governor && this.governor.connectionEstablisher.func)
            clearInterval(this.connectionGovernor.connectionEstablisher.func);

        this.governor = {
            isConnected: false,
            hasTimedOut: false, // after connectionEstablisher.remaining = 0
            connectionEstablisher: {
                func: false,
                remaining: 5 // try 5 times, 1 second span
            },
            queue: [],
            reconnect: () => {
                console.log('MessageDuplexChild requested reconnect');
            }
        };
    }

    connectionGovernor() {
        if(this.isHost)
            throw new Error('Host port cannot establish governor status');
    }

    handleMessage({ action, data, messageID, noAck = false }) {
        // logger.info('Received new message', { action, data, messageID });

        if(action == 'messageReply')
            return this.handleReply(data);

        if(noAck)
            return this.emit(action, data);

        this.incoming.set(messageID, res => (
            this.send('messageReply', { messageID, ...res }, false)
        ));

        this.emit(action, {
            resolve: res => {
                if(!this.incoming.get(messageID))
                    return console.log(`Message ${ messageID } expired`);

                this.incoming.get(messageID)({ error: false, res });
                this.incoming.delete(messageID);
            },
            reject: res => {
                if(!this.incoming.get(messageID))
                    return console.log(`Message ${ messageID } expired`);

                this.incoming.get(messageID)({ error: true, res });
                this.incoming.delete(messageID);
            },
            data
        });
    }

    handleReply({ messageID, error, res }) {
        if(!this.outgoing.has(messageID))
            return;

        if(error)
            this.outgoing.get(messageID)(Promise.reject(res));
        else this.outgoing.get(messageID)(res);

        this.outgoing.delete(messageID);
    }

    send(action, data, requiresAck = true) {

        const { governor } = this;

        if(!governor.isConnected && !governor.hasTimedOut) {
            
            return new Promise((resolve, reject) => governor.queue.push({
                action,
                data,
                resolve,
                reject
            }));
        }

        if(!governor.isConnected && governor.hasTimedOut)
            return Promise.reject('Failed to establish connection to extension');

        if(!requiresAck)
            return this.channel.postMessage({ action, data, noAck: true });

        return new Promise((resolve, reject) => {
            const messageID = randomUUID();

            this.outgoing.set(messageID, resolve);

            this.channel.postMessage({
                action,
                data,
                messageID,
                noAck: false
            });
        });
    }
}

export default MessageDuplexChild;