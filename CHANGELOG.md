# Changelog

The format is based on [Keep a Changelog](http://keepachangelog.com/)
and this project adheres to [Semantic Versioning](http://semver.org/).

## [3.0.4] - 2020-05-19
### Changed
- Added `error.message` into logged error
- Added integration test to confirm `application/x-www-form-urlencoded` requests work

## [3.0.3] - 2020-05-19
### Changed
- Incorporated user `mattdelsordo` to support binary response and abbreviate logging

## [3.0.2] - 2020-05-19
### Changed
- Updated CircleCI and Greenkeeper badges in README.md

## [3.0.1] - 2020-05-19
### Added
- Added `.codacy.yml` for Codacy analysis
- Added `.mocharc.yml`

### Changed
- Migrated to using `nyc` from `istanbul`
- Migrated `husky` pre-push hooks
- Migrated to CircleCI v2 pipelines
- Updated `devDependencies` to latest versions
- Updated `package.json` to new Node.js and NPM version compatibility
