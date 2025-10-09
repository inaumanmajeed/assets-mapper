# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.1.0] - 2024-10-09

### Added
- **Recursive Directory Scanning**: Now scans subdirectories automatically to find all image assets
- **File Watching**: Added `--watch` flag to automatically regenerate assets map when files change
- **Smart Duplicate Handling**: Only adds folder prefixes to export names when actual filename conflicts exist
- **Auto-cleanup on Uninstall**: Automatically removes generated assets map files when package is uninstalled
- **Enhanced CLI**: Better help messages and error handling

### Changed
- **Project Renamed**: Changed from `react-assets-mapper` to `assets-mapper` for broader framework support
- **Improved Export Names**: Export names are now simpler (e.g., `assetsMap.logo`) unless duplicates exist
- **Better Error Messages**: More descriptive error messages and warnings

### Fixed
- **Nested Folder Support**: Fixed issue where nested folders were not being scanned
- **Duplicate Detection**: Improved logic for handling duplicate filenames across directories
- **Path Resolution**: Better handling of relative and absolute paths across different operating systems

## [1.0.2] - 2024-10-09

### Fixed
- GitHub Actions deployment pipeline
- NPM publishing workflow

## [1.0.1] - 2024-10-09

### Fixed
- Initial package configuration issues

## [1.0.0] - 2024-10-09

### Added
- Initial release as `react-assets-mapper`
- Basic assets map generation
- CLI interface
- Support for common image formats (PNG, JPG, SVG, etc.)