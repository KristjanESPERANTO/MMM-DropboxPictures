# Changelog

All notable changes to this project will be documented in this file. See [commit-and-tag-version](https://github.com/absolute-version/commit-and-tag-version) for commit guidelines.

## [3.1.2](https://github.com/MMRIZE/MMM-DropboxPictures/compare/v3.1.1...v3.1.2) (2026-06-28)


### Fixed

* **dropbox:** cache reverse geocode hits ([7938bf7](https://github.com/MMRIZE/MMM-DropboxPictures/commit/7938bf795f551b8bf71d7bde4ead781a874260c5))


### Chores

* add unit tests ([7516c27](https://github.com/MMRIZE/MMM-DropboxPictures/commit/7516c274a57368cfbe101124410ab0a8c335b85b))
* correct indentation in README configuration examples ([ff6dac6](https://github.com/MMRIZE/MMM-DropboxPictures/commit/ff6dac691d18ac44f7685eaa7be259a70cac1706))
* **package:** fix package metadata ([b91ad6b](https://github.com/MMRIZE/MMM-DropboxPictures/commit/b91ad6bc160a43b540add038d4d8c9e61e16774a))
* update .prettierignore to include CHANGELOG.md and README.md ([1baa541](https://github.com/MMRIZE/MMM-DropboxPictures/commit/1baa5419f9b4c218ac8e99f485c921ea3a0d2d9d))
* update dependencies ([c8d342f](https://github.com/MMRIZE/MMM-DropboxPictures/commit/c8d342f281b97dfef4c98a6bc3fae5d6e8e35f6c))


### Code Refactoring

* **config:** use native env file loading ([7d006d1](https://github.com/MMRIZE/MMM-DropboxPictures/commit/7d006d1dd1b91e5a1458cdf1a9bd67155e98305a))
* **tests:** group tests ([38bbac5](https://github.com/MMRIZE/MMM-DropboxPictures/commit/38bbac5c0e2762a30862e08cb39d6d8ba096d372))


### Continuous Integration

* update branch names in automated tests workflow ([e211014](https://github.com/MMRIZE/MMM-DropboxPictures/commit/e211014606b5deba3b6c5b1c377f28d7bac54d92))

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
