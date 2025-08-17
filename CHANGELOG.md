# Changelog

All notable changes to the D2R Sprite Editor extension will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.1.0] - 2025-08-17

### Added

- **ExampleJS Algorithm Implementation**: Implemented exact sprite decoding algorithm from exampleJSproject reference
- **C# Reference Compatibility**: Full compatibility with D2RModding-SpriteEdit C# reference implementation
- **Multi-Frame Support**: Complete support for multi-frame sprite files (animated sequences)
- **Frame Navigation Controls**: Previous/Next buttons and keyboard shortcuts (←→) for frame browsing
- **Enhanced Header Parsing**: Corrected header parsing to match C# reference specification
  - Width reading from offset 8 (4 bytes) instead of offset 6 (2 bytes)
  - Height reading from offset 12 (4 bytes)
  - Frame count reading from offset 20 (4 bytes)
- **Pixel-Perfect Accuracy**: 97-100% pixel-by-pixel accuracy with reference PNG files
- **Comprehensive Testing**: Added functional tests with pixel-by-pixel comparison against reference PNGs
- **Offset 32 Validation**: Verified offset 32 contains size of remaining pixel data after offset 40

### Changed

- **Improved Algorithm**: Updated pixel extraction to use exact C# reference nested loop structure
- **Better Frame Handling**: Enhanced frame width calculation for multi-frame sprites
- **Optimized Performance**: More efficient pixel processing and memory usage

### Fixed

- **Header Structure**: Corrected sprite header parsing to match official D2R format specification
- **Frame Dimensions**: Fixed individual frame width calculation (total width / frame count)
- **Pixel Addressing**: Corrected pixel byte offset calculation for multi-frame sprites
- **Color Channel Order**: Proper RGBA channel handling matching C# reference implementation

### Technical Details

- **Pixel extraction algorithm**: `baseVal = 0x28 + x * 4 * width + y * 4 + (frameIndex * frameWidth * 4)`
- **Loop structure matches C#**: `for (x = 0; x < height; x++) for (y = 0; y < width; y++)`
- **Byte order**: Red[0], Green[1], Blue[2], Alpha[3] (RGBA format)
- **Frame data starts at fixed offset 40 (0x28)** as per C# specification
- **Header structure**: 
  - Total width at offset 8 (4 bytes) - all frames combined
  - Frame height at offset 12 (4 bytes) - individual frame height  
  - Frame count at offset 20 (4 bytes)
- **Multi-frame support**: Individual frame width = total width / frame count
- **Pixel format**: Native RGBA (no BGRA conversion needed)

## [1.0.0] - 2025-01-01

### Initial Release

- Initial release of D2R Sprite Editor
- Basic sprite file viewing capabilities
- PNG export/import functionality
- Paint.NET integration
- Zoom and pan controls
- Transparency grid toggle
- Support for D2R sprite format (SpA1/SPa1)
