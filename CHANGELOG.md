# Changelog

All notable changes to this project will be documented in this file. See [commit-and-tag-version](https://github.com/absolute-version/commit-and-tag-version) for commit guidelines.

## [3.1.1](https://github.com/MMRIZE/MMM-DropboxPictures/compare/v3.1.0...v3.1.1) (2026-01-03)


### Documentation

* add Code of Conduct file ([d821209](https://github.com/MMRIZE/MMM-DropboxPictures/commit/d821209e570982eb38390d3bbb8bcf15089679a2))
* add update instructions ([29b07d2](https://github.com/MMRIZE/MMM-DropboxPictures/commit/29b07d29bf583951a14c1fdae1af3fdf977b4fb1))


### Chores

* add Dependabot configuration for GitHub Actions and npm ([ae66562](https://github.com/MMRIZE/MMM-DropboxPictures/commit/ae6656250349f34cc288ba70a981a7ff516cd762))
* add release script and commit-and-tag-version for versioning ([26e07f1](https://github.com/MMRIZE/MMM-DropboxPictures/commit/26e07f1c17b85dbd27524d21303e94f429126042))
* update dependencies ([2ab6d2b](https://github.com/MMRIZE/MMM-DropboxPictures/commit/2ab6d2bebffb3931c6cc6403f6f1a3f19c126292))


### Continuous Integration

* add automated testing workflow for linting ([524edf4](https://github.com/MMRIZE/MMM-DropboxPictures/commit/524edf4fcdac1e834ec02892d7789c4e6f1f3b0a))

## [3.1.0](https://github.com/MMRIZE/MMM-DropboxPictures/compare/v3.0.0...v3.1.0) - 2025-07-20

### Changed

- **DROPBOX SDK DEPENDENCY REMOVED** - Now uses direct HTTP API calls
- Improved authentication with better scope handling
- Better error handling and debugging information
- Reduced bundle size and memory footprint
- Enhanced path detection for App-folder vs Full-Dropbox apps
- Direct HTTP API implementation
- Better authentication flow
- refactor: review linter setup (add prettier, markdown and css linting, ...)
- docs: move changelog to separate file

### Removed

- Dropbox SDK and node-fetch dependency (replaced with native fetch API)

## [3.0.0](https://github.com/MMRIZE/MMM-DropboxPictures/releases/tag/v3.0.0) - 2023-11-09

### Changed

- **FULLY REBUILT FROM SCRATCH** - You need to reinstall and reconfigure
- Using recent Dropbox V2 API (SDK ^10.34)
- New OAUTH authentication
- Dynamic configuration on the fly (by notification)

### Deprecated

- Auto-rotation feature

### Removed

- 3rd-party dependencies as many as possible

### Breaking Changes

- Complete rebuild requires reinstallation and reconfiguration
