const timestampToDate = _timestamp => {
  const date = new Date(_timestamp)
  const todate = date.getDate()
  const tomonth = date.getMonth() + 1
  const toyear = date.getFullYear()
  const hours = date.getHours()
  const minutes = `0${date.getMinutes()}`
  const seconds = `0${date.getSeconds()}`
  return `${hours}:${minutes.substr(-2)}:${seconds.substr(
    -2
  )} - ${tomonth}/${todate}/${toyear}`
}

const logger = {
  error: msg =>
    console.error(`[${timestampToDate(new Date())}] [ERROR] - ${msg}`),
  log: msg => console.info(`[${timestampToDate(new Date())}] [INFO] - ${msg}`)
}

module.exports = logger
