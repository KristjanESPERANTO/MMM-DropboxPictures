const fs = require('node:fs')
const os = require('node:os')
const path = require('node:path')
const Module = require('node:module')

function loadHelperModule({ exifrStub } = {}) {
  const originalLoad = Module._load
  Module._load = (request, parent, isMain) => {
    if (request === 'node_helper') {
      return {
        create(definition) {
          return definition
        },
      }
    }
    if (request === 'exifr' && exifrStub) {
      return exifrStub
    }
    return originalLoad(request, parent, isMain)
  }

  delete require.cache[require.resolve('../../node_helper.js')]
  const helper = require('../../node_helper.js')
  Module._load = originalLoad

  return helper
}

function createHelperState(options = {}) {
  const helperDefinition = loadHelperModule(options)
  const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'dbxp-tests-'))
  const credentialsPath = path.join(tempDir, 'credentials.json')

  return {
    ...helperDefinition,
    credentialsPath,
    credentials: {
      access_token: 'old-token',
      refresh_token: 'refresh-token',
      expires_in: 3600,
      expires_at: Date.now() + 3600 * 1000,
      token_type: 'bearer',
      scope: 'files.metadata.read files.content.read',
    },
    accessToken: 'old-token',
  }
}

module.exports = {
  createHelperState,
}
