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
- **VSIX Packaging**: Production-ready extension packaging with native dependencies

#### Technical Improvements
- **TypeScript Rewrite**: Complete codebase modernization from JavaScript/Vue.js
- **VS Code Native**: Custom editor provider implementation using VS Code APIs
- **Canvas Integration**: Node.js canvas for PNG conversion and image processing
- **File Watching**: Automatic updates when external files change during editing
- **Memory Optimization**: Efficient handling of large sprite files
- **Native Dependencies**: Proper bundling of canvas module for cross-platform support

#### Features
- Automatic sprite file opening in VS Code when clicking `.sprite` files
- Pixelated rendering for crisp pixel art display
- Export sprite to PNG functionality with same-directory placement
- Import PNG to sprite functionality with file picker
- Real-time Paint.NET editing workflow with automatic sprite updates
- Background transparency grid toggle for better visibility
- Zoom and pan controls for large sprite navigation
- File validation and comprehensive error handling
- Backup creation during sprite updates (`.sprite.backup` files)

### Breaking Changes
- **Removed**: Original Vue.js frontend implementation
- **Removed**: DXT texture support (focused on D2R sprites only)
- **Removed**: PNG editing capabilities (sprite viewer focused)
- **Changed**: Extension activation model to custom editor provider
- **Requires**: VS Code 1.48.0 or higher
- **Requires**: Node.js canvas module for PNG conversion

### Developer Experience
- Professional test organization with Mocha framework
- Modern TypeScript configuration with strict type checking
- VS Code debugging integration and launch configurations
- Comprehensive documentation in `docs/` folder
- Performance benchmarking and memory usage tracking
- Automated testing with VS Code Test Runner

### Documentation
- **User Guide**: Complete step-by-step usage instructions
- **Development Guide**: Setup and contribution guidelines
- **Sprite Format**: Technical D2R sprite format specification
- **Testing**: Professional test organization and execution

---

## Previous Versions

This represents a complete rewrite from the original PNG editor concept. 
Previous versions (0.0.2 - 0.1.0) were experimental and have been superseded by this production release.
