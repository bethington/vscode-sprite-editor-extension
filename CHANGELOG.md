# Changelog

All notable changes to the D2R Sprite Editor extension will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.0.0] - 2025-08-10

### 🎉 Major Release - Complete Rewrite

#### Added
- **Modern D2R Sprite Viewer**: Custom editor for `.sprite` files
- **Paint.NET Integration**: External editing with automatic file sync
- **PNG Conversion**: Bidirectional sprite ↔ PNG conversion
- **Interactive Controls**: Zoom, pan, transparency grid toggle
- **Large File Support**: Optimized for sprites up to 512x512 pixels
- **Professional Testing**: Comprehensive test suite with unit, integration, and performance tests

#### Technical Improvements
- **TypeScript Rewrite**: Complete codebase modernization
- **VS Code Native**: Custom editor provider implementation
- **Canvas Integration**: Node.js canvas for PNG conversion
- **File Watching**: Automatic updates when external files change
- **Memory Optimization**: Efficient handling of large sprite files

#### Features
- Automatic sprite file opening in VS Code
- Pixelated rendering for crisp pixel art display
- Export sprite to PNG functionality
- Import PNG to sprite functionality
- Real-time Paint.NET editing workflow
- Background transparency grid toggle
- Zoom and pan controls
- File validation and error handling

### Breaking Changes
- **Removed**: Original Vue.js frontend implementation
- **Removed**: DXT texture support (focus on D2R sprites)
- **Removed**: PNG editing capabilities (sprite-focused)
- **Changed**: Extension activation to custom editor model

### Developer Experience
- Professional test organization
- Modern TypeScript configuration
- VS Code debugging integration
- Comprehensive documentation
- Performance benchmarking

---

## [0.1.0] - 2025-08-09 (Beta)

### Added
- Initial D2R sprite format support
- Basic sprite viewing functionality
- PNG conversion pipeline

### Technical
- Added DXT utility modules
- Enhanced image loading pipeline
- Updated package.json for sprite files

---

## Previous Versions

### [0.0.4] - 2021-08-12
- Legacy PNG editor functionality

### [0.0.3] - 2020-09-07
- Bug fixes and improvements

### [0.0.2] - 2020-09-06
- Initial sprite editor concept

* move vscode-easy-custom-editor to deps ([1ea61b6](https://github.com/hashrock/vscode-sprite-editor-extension/commit/1ea61b6ff37dff50b11b30aede818750f13ddda8))

### 0.0.2 (2020-09-07)


### Features

* add bg, stroke width ([931a3af](https://github.com/hashrock/vscode-sprite-editor-extension/commit/931a3af4c87bdfd07a1e6e3e25fe8ce7ca42834e))
* add floodfill ([7e302e5](https://github.com/hashrock/vscode-sprite-editor-extension/commit/7e302e5e8557f19ea620ee3f9aa3485b7f649795))
* add zoom selection ([8e4c9df](https://github.com/hashrock/vscode-sprite-editor-extension/commit/8e4c9df7d1d9d6e23058377bb569f81f0c3a23eb))
* dot editing ([4b8569c](https://github.com/hashrock/vscode-sprite-editor-extension/commit/4b8569c54cf512ed93314191e1ed1dd04c4f2dfa))
* palette ([2677fd1](https://github.com/hashrock/vscode-sprite-editor-extension/commit/2677fd1dbe798c0083b73a16254693598144dfca))


### Bug Fixes

* add tool radio ([0df0e0b](https://github.com/hashrock/vscode-sprite-editor-extension/commit/0df0e0b7cee0852a43208b4c6cd453dbc9bb4397))
* error on create new PNG ([635d302](https://github.com/hashrock/vscode-sprite-editor-extension/commit/635d30262ef7ff800461cd89d9535ac94b74f000))
