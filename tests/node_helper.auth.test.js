const assert = require('node:assert/strict')
const fs = require('node:fs')
const { describe, it } = require('node:test')

const { createHelperState } = require('./helpers/node-helper-test-utils.js')

describe('isAccessTokenExpired', () => {
  it('returns false when expires_at is missing', () => {
  const helper = createHelperState()
  delete helper.credentials.expires_at

    assert.equal(helper.isAccessTokenExpired(), false)
  })

  it('returns true when token is near expiry margin', () => {
  const helper = createHelperState()
  helper.credentials.expires_at = Date.now() + 10_000

    assert.equal(helper.isAccessTokenExpired(), true)
  })
})

describe('refreshAccessToken', () => {
  it('returns without fetch when refresh_token is missing', async () => {
  const helper = createHelperState()
  const originalFetch = global.fetch
  delete helper.credentials.refresh_token

  let fetchCalled = false
  global.fetch = async () => {
    fetchCalled = true
    throw new Error('fetch should not be called')
  }

  await helper.refreshAccessToken()

    assert.equal(fetchCalled, false)
    assert.equal(helper.accessToken, 'old-token')

    global.fetch = originalFetch
  })

  it('throws when DROPBOX_APP_KEY is missing', async () => {
  const helper = createHelperState()
  const originalAppKey = process.env.DROPBOX_APP_KEY
  delete process.env.DROPBOX_APP_KEY

  await assert.rejects(
    helper.refreshAccessToken(),
    /DROPBOX_APP_KEY is required to refresh Dropbox access tokens\./,
  )

    process.env.DROPBOX_APP_KEY = originalAppKey
  })

  it('updates token and persists credentials', async () => {
  const helper = createHelperState()
  const originalAppKey = process.env.DROPBOX_APP_KEY
  const originalSecret = process.env.DROPBOX_APP_SECRET
  const originalFetch = global.fetch

  process.env.DROPBOX_APP_KEY = 'test-app-key'
  process.env.DROPBOX_APP_SECRET = 'test-secret'
  global.fetch = async () => ({
    ok: true,
    json: async () => ({
      access_token: 'new-token',
      expires_in: 7200,
      token_type: 'bearer',
      scope: 'files.metadata.read files.content.read',
    }),
  })

  await helper.refreshAccessToken()

  assert.equal(helper.accessToken, 'new-token')
  assert.equal(helper.credentials.access_token, 'new-token')
  assert.equal(helper.credentials.expires_in, 7200)
  assert.ok(helper.credentials.refreshed_at)
  assert.equal(fs.existsSync(helper.credentialsPath), true)

  const persisted = JSON.parse(fs.readFileSync(helper.credentialsPath, 'utf8'))
  assert.equal(persisted.access_token, 'new-token')

    process.env.DROPBOX_APP_KEY = originalAppKey
    process.env.DROPBOX_APP_SECRET = originalSecret
    global.fetch = originalFetch
  })

  it('deduplicates concurrent refresh calls', async () => {
  const helper = createHelperState()
  const originalAppKey = process.env.DROPBOX_APP_KEY
  const originalFetch = global.fetch

  let callCount = 0
  process.env.DROPBOX_APP_KEY = 'test-app-key'
  global.fetch = async () => {
    callCount += 1
    return {
      ok: true,
      json: async () => ({
        access_token: 'single-flight-token',
        expires_in: 3600,
      }),
    }
  }

  await Promise.all([helper.refreshAccessToken(), helper.refreshAccessToken()])

    assert.equal(callCount, 1)
    assert.equal(helper.accessToken, 'single-flight-token')

    process.env.DROPBOX_APP_KEY = originalAppKey
    global.fetch = originalFetch
  })

  it('clears refreshPromise after failed refresh', async () => {
  const helper = createHelperState()
  const originalAppKey = process.env.DROPBOX_APP_KEY
  const originalFetch = global.fetch

  process.env.DROPBOX_APP_KEY = 'test-app-key'
  global.fetch = async () => ({
    ok: false,
    status: 500,
    text: async () => 'internal error',
  })

  await assert.rejects(
    helper.refreshAccessToken(),
    /Dropbox token refresh failed \(500\): internal error/,
  )
    assert.equal(helper.refreshPromise, null)

    process.env.DROPBOX_APP_KEY = originalAppKey
    global.fetch = originalFetch
  })
})

describe('ensureAccessToken', () => {
  it('refreshes only when token is expired', async () => {
  const helper = createHelperState()

  let refreshCount = 0
  helper.refreshAccessToken = async () => {
    refreshCount += 1
  }

  helper.credentials.expires_at = Date.now() + 10_000
  await helper.ensureAccessToken()

  helper.credentials.expires_at = Date.now() + 120_000
  await helper.ensureAccessToken()

    assert.equal(refreshCount, 1)
  })
})
