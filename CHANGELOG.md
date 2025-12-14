# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [2.0.2] - 2025-12-14

### Fixed
- **Duplicate Handling**: Fixed critical bug where duplicate filenames would rename ALL occurrences, breaking existing component references
- **Smart Renaming**: Now only the second and subsequent duplicates get folder prefixes, preserving the first occurrence with its simple name
- **Example**: If `logo.png` exists in two folders, the first keeps name `logo`, only the second becomes `folder_logo`

## [2.0.1] - 2025-10-09

### Changed
- **Documentation**: Updated README with comprehensive TypeScript examples and CLI usage
- **Examples**: Added TypeScript output examples showing both .js and .ts file generation
- **Clarity**: Enhanced documentation to better showcase v2.0.0 TypeScript features

## [2.0.0] - 2025-10-09

### Added
- **Full TypeScript Migration**: Complete rewrite in TypeScript with full type safety
- **Type Definitions**: Generated `.d.ts` files for better IDE support and autocomplete
- **Enhanced CLI Types**: Strongly typed CLI arguments and error handling
- **Production Build Pipeline**: Automated TypeScript compilation to optimized JavaScript
- **Prettier Integration**: Automatic code formatting with pre-commit hooks

### Changed
- **BREAKING**: Migrated from JavaScript to TypeScript (no API changes, fully backward compatible)
- **Build Process**: Now compiles TypeScript source to JavaScript in `lib/` directory
- **Project Structure**: Cleaner separation of source (`src/`) and compiled (`lib/`) code
- **CLI Location**: Compiled CLI moved to `lib/bin/assets-mapper.js` for cleaner distribution

### Fixed
- **Type Safety**: All functions now have proper type annotations and error handling
- **Import Paths**: Resolved module resolution issues in compiled CLI
- **Build Reliability**: More robust compilation process with better error reporting

## [1.1.0] - 2025-10-09

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

## [1.0.2] - 2025-10-09

### Fixed
- GitHub Actions deployment pipeline
- NPM publishing workflow

## [1.0.1] - 2025-10-09

### Fixed
- Initial package configuration issues

## [1.0.0] - 2025-10-09

### Added
- Initial release as `react-assets-mapper`
- Basic assets map generation
- CLI interface
- Support for common image formats (PNG, JPG, SVG, etc.)