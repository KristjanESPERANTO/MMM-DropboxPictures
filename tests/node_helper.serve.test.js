const assert = require('node:assert/strict')
const fs = require('node:fs')
const path = require('node:path')
const test = require('node:test')

const { createHelperState } = require('./helpers/node-helper-test-utils.js')

async function withSilencedConsoleError(run) {
  const originalConsoleError = console.error
  console.error = () => {}

  try {
    return await run()
  } finally {
    console.error = originalConsoleError
  }
}

test('socketNotificationReceived dispatches INITIALIZE SCAN and SERVE', async () => {
  const helper = createHelperState()

  const calls = []
  helper.initializeAfterLoading = () => {
    calls.push('INITIALIZE')
  }
  helper.scan = async (payload) => {
    calls.push(['SCAN', payload])
    return { scanned: [] }
  }
  helper.sendSocketNotification = () => {}
  helper.serve = async (payload) => {
    calls.push(['SERVE', payload])
  }

  await helper.socketNotificationReceived('INITIALIZE')
  await helper.socketNotificationReceived('SCAN', { directory: '/a' })
  await helper.socketNotificationReceived('SERVE', { item: { name: 'x' } })

  assert.deepEqual(calls, ['INITIALIZE', ['SCAN', { directory: '/a' }], ['SERVE', { item: { name: 'x' } }]])
})

test('serve sends SERVED payload on successful download and metadata', async () => {
  const helper = createHelperState({
    exifrStub: {
      parse: async () => ({ Make: 'TestCam' }),
    },
  })
  const originalWriteFileSync = fs.writeFileSync

  helper.sendSocketNotification = (name, payload) => {
    helper.lastNotification = { name, payload }
  }
  helper.dropboxDownload = async () => ({
    status: 200,
    result: { fileBinary: new TextEncoder().encode('img').buffer },
  })
  helper.dropboxRequest = async () => ({
    media_info: { metadata: { location: { latitude: 1, longitude: 2 } } },
  })

  let wroteTemp = false
  fs.writeFileSync = (targetPath) => {
    wroteTemp = targetPath.endsWith(path.join('cache', 'temp'))
  }

  await helper.serve({
    item: { name: 'pic.jpg', path_lower: '/pic.jpg' },
    options: { thumbnail: false, reverseGeocoding: false, locale: 'en' },
  })

  assert.equal(wroteTemp, true)
  assert.equal(helper.lastNotification.name, 'SERVED')
  assert.equal(helper.lastNotification.payload.serving.item.name, 'pic.jpg')
  assert.equal(helper.lastNotification.payload.serving.exif.Make, 'TestCam')
  assert.equal(
    helper.lastNotification.payload.serving.item.media_info.metadata.location.latitude,
    1,
  )

  fs.writeFileSync = originalWriteFileSync
})

test('serve falls back to /files/download when thumbnail download fails', async () => {
  const helper = createHelperState({
    exifrStub: {
      parse: async () => ({ latitude: 1, longitude: 2 }),
    },
  })
  const originalWriteFileSync = fs.writeFileSync

  helper.sendSocketNotification = (name, payload) => {
    helper.lastNotification = { name, payload }
  }

  const calledEndpoints = []
  helper.dropboxDownload = async (endpoint) => {
    calledEndpoints.push(endpoint)
    if (endpoint === '/files/get_thumbnail_v2') {
      throw new Error('thumbnail unavailable')
    }
    return {
      status: 200,
      result: { fileBinary: new TextEncoder().encode('img').buffer },
    }
  }
  helper.dropboxRequest = async () => ({})
  fs.writeFileSync = () => {}

  await helper.serve({
    item: { name: 'pic.jpg', path_lower: '/pic.jpg' },
    options: { thumbnail: '128x128', reverseGeocoding: false, locale: 'en' },
  })

  assert.deepEqual(calledEndpoints, ['/files/get_thumbnail_v2', '/files/download'])
  assert.equal(helper.lastNotification.name, 'SERVED')

  fs.writeFileSync = originalWriteFileSync
})

test('serve falls back to original download for unsupported thumbnail size', async () => {
  const helper = createHelperState({
    exifrStub: {
      parse: async () => ({ latitude: 1, longitude: 2 }),
    },
  })
  const originalWriteFileSync = fs.writeFileSync

  helper.sendSocketNotification = (name, payload) => {
    helper.lastNotification = { name, payload }
  }

  const calledEndpoints = []
  helper.dropboxDownload = async (endpoint) => {
    calledEndpoints.push(endpoint)
    return {
      status: 200,
      result: { fileBinary: new TextEncoder().encode('img').buffer },
    }
  }
  helper.dropboxRequest = async () => ({})
  fs.writeFileSync = () => {}

  await helper.serve({
    item: { name: 'pic.jpg', path_lower: '/pic.jpg' },
    options: { thumbnail: '999x999', reverseGeocoding: false, locale: 'en' },
  })

  assert.deepEqual(calledEndpoints, ['/files/download'])
  assert.equal(helper.lastNotification.name, 'SERVED')

  fs.writeFileSync = originalWriteFileSync
})

test('serve sends SERVE_FAILED when download response is not successful', async () => {
  const helper = createHelperState({
    exifrStub: {
      parse: async () => null,
    },
  })

  helper.sendSocketNotification = (name, payload) => {
    helper.lastNotification = { name, payload }
  }
  helper.dropboxDownload = async () => ({
    status: 500,
    result: { fileBinary: new TextEncoder().encode('img').buffer },
  })
  helper.dropboxRequest = async () => ({})

  await withSilencedConsoleError(async () => {
    await helper.serve({
      item: { name: 'broken.jpg', path_lower: '/broken.jpg' },
      options: { thumbnail: false, reverseGeocoding: false, locale: 'en' },
    })
  })

  assert.equal(helper.lastNotification.name, 'SERVE_FAILED')
  assert.equal(helper.lastNotification.payload.item.name, 'broken.jpg')
  assert.match(String(helper.lastNotification.payload.err.message), /Failed to download/)
})

test('serve sends SERVE_FAILED when both metadata and exif location are missing', async () => {
  const helper = createHelperState({
    exifrStub: {
      parse: async () => null,
    },
  })
  const originalWriteFileSync = fs.writeFileSync

  helper.sendSocketNotification = (name, payload) => {
    helper.lastNotification = { name, payload }
  }
  helper.dropboxDownload = async () => ({
    status: 200,
    result: { fileBinary: new TextEncoder().encode('img').buffer },
  })
  helper.dropboxRequest = async () => ({})
  fs.writeFileSync = () => {}

  await withSilencedConsoleError(async () => {
    await helper.serve({
      item: { name: 'noloc.jpg', path_lower: '/noloc.jpg' },
      options: { thumbnail: false, reverseGeocoding: true, locale: 'en' },
    })
  })

  assert.equal(helper.lastNotification.name, 'SERVE_FAILED')
  assert.equal(helper.lastNotification.payload.item.name, 'noloc.jpg')
  assert.match(String(helper.lastNotification.payload.err.message), /latitude/)

  fs.writeFileSync = originalWriteFileSync
})

test('serve reuses cached reverse geocode results for identical coordinates', async () => {
  const helper = createHelperState({
    exifrStub: {
      parse: async () => ({ latitude: 12.34, longitude: 56.78 }),
    },
  })
  const originalWriteFileSync = fs.writeFileSync
  const originalFetch = global.fetch
  const originalLocationToken = process.env.LOCATIONIQ_TOKEN

  process.env.LOCATIONIQ_TOKEN = 'test-locationiq-token'

  helper.sendSocketNotification = (name, payload) => {
    helper.lastNotification = { name, payload }
  }
  helper.dropboxDownload = async () => ({
    status: 200,
    result: { fileBinary: new TextEncoder().encode('img').buffer },
  })
  helper.dropboxRequest = async () => ({})
  fs.writeFileSync = () => {}

  let locationFetchCount = 0
  global.fetch = async (url) => {
    if (String(url).includes('locationiq')) {
      locationFetchCount += 1
      return {
        json: async () => ({ address: { city: 'Test City' } }),
      }
    }

    return {
      ok: true,
      status: 200,
      json: async () => ({}),
    }
  }

  await helper.serve({
    item: { name: 'cached.jpg', path_lower: '/cached.jpg' },
    options: { thumbnail: false, reverseGeocoding: true, locale: 'en' },
  })
  await helper.serve({
    item: { name: 'cached-2.jpg', path_lower: '/cached-2.jpg' },
    options: { thumbnail: false, reverseGeocoding: true, locale: 'en' },
  })

  assert.equal(locationFetchCount, 1)

  process.env.LOCATIONIQ_TOKEN = originalLocationToken
  global.fetch = originalFetch
  fs.writeFileSync = originalWriteFileSync
})
