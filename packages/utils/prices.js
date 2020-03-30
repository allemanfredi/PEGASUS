import axios from 'axios'

const getPrice = () =>
  new Promise((resolve, reject) =>
    axios
      .get(
        'https://api.coingecko.com/api/v3/simple/price?ids=iota&vs_currencies=usd%2Cgbp%2Ceur%2Cchf'
      )
      .then(res => resolve(res.data.iota))
      .catch(err => reject(err))
  )

export { getPrice }
