
const options = {
    network: [
        { name: 'nodes.thetangle.org',
            provider: 'https://nodes.thetangle.org:443',
            link : 'https://thetangle.org/',
            id: 0,
            type: 'mainnet',
            difficulty: 14
        },
        {
            name: 'nodes.devnet.iota.org',
            provider: 'https://nodes.devnet.iota.org',
            link : 'https://devnet.thetangle.org/',
            id: 1,
            type: 'testnet',
            difficulty: 9
        },
        { 
            name: 'localhost:14265',
            provider: 'http://localhost:14265',
            link : 'https://thetangle.org/',
            id: 3,
            type: 'mainnet',
            difficulty: 14
        },

    ]
};

export default options;