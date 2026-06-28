const assert = require('node:assert/strict')
const { describe, it } = require('node:test')

const { createHelperState } = require('./helpers/node-helper-test-utils.js')

describe('scan', () => {
  it('filters non-files, non-downloadables, and extensions', async () => {
  const helper = createHelperState()

  helper.dropboxRequest = async (endpoint) => {
    if (endpoint === '/files/list_folder') {
      return {
        entries: [
          { '.tag': 'folder', is_downloadable: true, name: 'albums' },
          { '.tag': 'file', is_downloadable: false, name: 'skip.jpg' },
          { '.tag': 'file', is_downloadable: true, name: 'keep.JPG' },
          { '.tag': 'file', is_downloadable: true, name: 'skip.png' },
        ],
        has_more: false,
      }
    }

    throw new Error(`Unexpected endpoint: ${endpoint}`)
  }

  const result = await helper.scan({
    verbose: false,
    directory: '',
    fileExtensions: ['jpg'],
  })

    assert.equal(result.scanned.length, 1)
    assert.equal(result.scanned[0].name, 'keep.JPG')
  })

  it('tries directory path variations and uses first valid folder', async () => {
  const helper = createHelperState()
  const metadataPaths = []
  let listFolderPath = null

  helper.dropboxRequest = async (endpoint, body) => {
    if (endpoint === '/files/get_metadata') {
      metadataPaths.push(body.path)
      if (body.path === 'Photos') {
        return { '.tag': 'folder' }
      }
      throw new Error('path/not_found')
    }

    if (endpoint === '/files/list_folder') {
      listFolderPath = body.path
      return { entries: [], has_more: false }
    }

    throw new Error(`Unexpected endpoint: ${endpoint}`)
  }

  const result = await helper.scan({
    verbose: false,
    directory: '/Photos',
    fileExtensions: [],
  })

    assert.equal(result.scanned.length, 0)
    assert.deepEqual(metadataPaths, ['/Photos', 'Photos'])
    assert.equal(listFolderPath, 'Photos')
  })

  it('follows pagination through list_folder/continue', async () => {
  const helper = createHelperState()

  helper.dropboxRequest = async (endpoint, body) => {
    if (endpoint === '/files/list_folder') {
      return {
        entries: [{ '.tag': 'file', is_downloadable: true, name: '1.jpg' }],
        has_more: true,
        cursor: 'c1',
      }
    }

    if (endpoint === '/files/list_folder/continue') {
      if (body.cursor === 'c1') {
        return {
          entries: [{ '.tag': 'file', is_downloadable: true, name: '2.jpg' }],
          has_more: true,
          cursor: 'c2',
        }
      }
      if (body.cursor === 'c2') {
        return {
          entries: [{ '.tag': 'file', is_downloadable: true, name: '3.jpg' }],
          has_more: false,
        }
      }
    }

    throw new Error(`Unexpected call: ${endpoint}`)
  }

  const result = await helper.scan({
    verbose: false,
    directory: '',
    fileExtensions: ['jpg'],
  })

    assert.deepEqual(
      result.scanned.map((item) => item.name),
      ['1.jpg', '2.jpg', '3.jpg'],
    )
  })

  it('falls back to root when all directory variations fail', async () => {
  const helper = createHelperState()
  const metadataPaths = []
  let rootScanned = false

  helper.dropboxRequest = async (endpoint, body) => {
    if (endpoint === '/files/get_metadata') {
      metadataPaths.push(body.path)
      throw new Error('path/not_found')
    }

    if (endpoint === '/files/list_folder') {
      rootScanned = body.path === ''
      return { entries: [], has_more: false }
    }

    throw new Error(`Unexpected endpoint: ${endpoint}`)
  }

  const result = await helper.scan({
    verbose: false,
    directory: '/Missing',
    fileExtensions: [],
  })

    assert.equal(result.scanned.length, 0)
    assert.deepEqual(metadataPaths, ['/Missing', 'Missing', '/Missing'])
    assert.equal(rootScanned, true)
  })
})
