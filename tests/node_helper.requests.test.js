const assert = require('node:assert/strict')
const test = require('node:test')

const { createHelperState } = require('./helpers/node-helper-test-utils.js')

test('dropboxRequest retries once after 401 using refreshed token', async () => {
  const helper = createHelperState()
  const originalFetch = global.fetch

  helper.ensureAccessToken = async () => {}
  let refreshCount = 0
  helper.refreshAccessToken = async () => {
    refreshCount += 1
    helper.accessToken = 'new-token'
  }

  const calls = []
  global.fetch = async (url, options) => {
    calls.push({ url, auth: options.headers.Authorization })

    if (calls.length === 1) {
      return {
        ok: false,
        status: 401,
        text: async () => 'expired',
      }
    }

    return {
      ok: true,
      status: 200,
      json: async () => ({ entries: [] }),
    }
  }

  const result = await helper.dropboxRequest('/files/list_folder', { path: '' })

  assert.deepEqual(result, { entries: [] })
  assert.equal(refreshCount, 1)
  assert.equal(calls.length, 2)
  assert.equal(calls[0].auth, 'Bearer old-token')
  assert.equal(calls[1].auth, 'Bearer new-token')

  global.fetch = originalFetch
})

test('dropboxRequest throws API error when 401 and no refresh_token', async () => {
  const helper = createHelperState()
  const originalFetch = global.fetch

  helper.ensureAccessToken = async () => {}
  delete helper.credentials.refresh_token

  global.fetch = async () => ({
    ok: false,
    status: 401,
    text: async () => 'expired token',
  })

  await assert.rejects(
    helper.dropboxRequest('/files/list_folder', { path: '' }),
    /Dropbox API Error \(401\): expired token/,
  )

  global.fetch = originalFetch
})

test('dropboxRequest uses content API base when requested', async () => {
  const helper = createHelperState()
  const originalFetch = global.fetch

  helper.ensureAccessToken = async () => {}

  let requestUrl = ''
  global.fetch = async (url) => {
    requestUrl = url
    return {
      ok: true,
      status: 200,
      json: async () => ({ ok: true }),
    }
  }

  await helper.dropboxRequest('/files/list_folder', { path: '' }, true)
  assert.match(requestUrl, /^https:\/\/content\.dropboxapi\.com\/2\/files\/list_folder$/)

  global.fetch = originalFetch
})

test('dropboxDownload retries once after 401 using refreshed token', async () => {
  const helper = createHelperState()
  const originalFetch = global.fetch

  helper.ensureAccessToken = async () => {}
  helper.refreshAccessToken = async () => {
    helper.accessToken = 'new-token'
  }

  const calls = []
  global.fetch = async (url, options) => {
    calls.push({ url, auth: options.headers.Authorization })

    if (calls.length === 1) {
      return {
        ok: false,
        status: 401,
        text: async () => 'expired',
      }
    }

    return {
      ok: true,
      status: 200,
      arrayBuffer: async () => new TextEncoder().encode('ok').buffer,
    }
  }

  const response = await helper.dropboxDownload('/files/download', { path: '/img.jpg' })

  assert.equal(response.status, 200)
  assert.equal(calls.length, 2)
  assert.equal(calls[0].auth, 'Bearer old-token')
  assert.equal(calls[1].auth, 'Bearer new-token')

  global.fetch = originalFetch
})

test('dropboxDownload throws detailed error for non-401 response', async () => {
  const helper = createHelperState()
  const originalFetch = global.fetch

  helper.ensureAccessToken = async () => {}

  global.fetch = async () => ({
    ok: false,
    status: 403,
    text: async () => 'forbidden',
  })

  await assert.rejects(
    helper.dropboxDownload('/files/download', { path: '/img.jpg' }),
    /Dropbox Download Error \(403\): forbidden/,
  )

  global.fetch = originalFetch
})
