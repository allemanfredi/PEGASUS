/**
 *
 * used to transfor a map of maps into a single array
 * in order to better use it
 *
 * @param {Object} _connectionRequests
 */
const normalizeConnectionRequests = _connectionRequests => {
  const normalizedConnections = []
  for (let originConnections of Object.values(_connectionRequests)) {
    for (let connection of Object.values(originConnections))
      normalizedConnections.push(connection)
  }
  return normalizedConnections
}

export { normalizeConnectionRequests }
