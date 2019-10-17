
const options = {
  networks: [
    {
      name: 'nodes.thetangle.org',
      provider: 'https://nodes.thetangle.org:443',
      link: 'https://thetangle.org/',
      type: 'mainnet',
      difficulty: 14,
      default: true
    },
    {
      name: 'nodes.devnet.iota.org',
      provider: 'https://nodes.devnet.iota.org',
      link: 'https://devnet.thetangle.org/',
      type: 'testnet',
      difficulty: 9,
      default: true
    },
    {
      name: 'localhost:14265',
      provider: 'http://localhost:14265',
      link: 'https://thetangle.org/',
      type: 'mainnet',
      difficulty: 14,
      default: true
    }

  ]
}

export default options
