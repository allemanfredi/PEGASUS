/**
 *
 * Returns the website metadata
 */
const getWebsiteMetadata = async () => {
  return {
    name: getWebsiteName(window),
    icon: await getWebsiteIcon(window)
  }
}

/**
 *
 * Returns the website name
 */
const getWebsiteName = _window => {
  const { document } = _window

  const siteName = document.querySelector(
    'head > meta[property="og:site_name"]'
  )
  if (siteName) {
    return siteName.content
  }

  const metaTitle = document.querySelector('head > meta[name="title"]')
  if (metaTitle) {
    return metaTitle.content
  }

  if (document.title && document.title.length > 0) {
    return document.title
  }

  return _window.location.hostname
}

/**
 *
 * Returns the website icon
 */
const getWebsiteIcon = async _window => {
  const { document } = _window

  let icon = document.querySelector('head > link[rel="shortcut icon"]')
  if (icon && (await resourceExists(icon.href))) {
    return icon.href
  }

  icon = Array.from(
    document.querySelectorAll('head > link[rel="icon"]')
  ).find(_icon => Boolean(_icon.href))
  if (icon && (await resourceExists(icon.href))) {
    return icon.href
  }

  return null
}

/**
 *
 * Check if a resource exists
 */
const resourceExists = _url =>
  new Promise(_resolve => {
    fetch(_url, { method: 'HEAD', mode: 'same-origin' })
      .then(_res => _resolve(_res.status === 200))
      .catch(() => _resolve(false))
  })

export { getWebsiteMetadata }
