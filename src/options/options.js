
const options = {
    network : [
        {   name : 'Mainnet',
            provider : 'https://nodes.thetangle.org:443',
            id : 1,
            type : 'mainnet'
        },
        {
            name : 'Testnet',
            provider : 'https://nodes.testnet.iota.org',
            id : 0,
            type : 'testnet'
        },
        {   name : 'Custom Node',
            provider : 'http://localhost:14265',
            id : 2,
            type : 'testnet'
        },
        
    ]
}   


export default options 