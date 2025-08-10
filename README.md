# D2R Sprite Editor

A Visual Studio Code extension for viewing and editing Diablo 2 Resurrected (D2R) sprite files.

![Extension Preview](https://user-images.githubusercontent.com/3132889/92393088-467a6b00-f15a-11ea-8d04-f1e5bda9b5ba.gif)

## Features

- **D2R Sprite Viewer**: Automatically opens `.sprite` files in a dedicated viewer
- **Pixelated Rendering**: Crisp pixel art display optimized for sprite files
- **Interactive Controls**: Zoom, pan, and toggle transparency grid
- **Paint.NET Integration**: Edit sprites externally with automatic sync
- **PNG Conversion**: Export sprites to PNG and import PNG back to sprite format
- **Large File Support**: Handles sprites up to 512x512 pixels efficiently

## Supported Formats

- **D2R Sprites** (`.sprite` files): SpA1/SPa1 format with BGRA pixel data
- Used for character sprites, items, and game assets in Diablo 2 Resurrected

## Quick Start

1. **Open a sprite file**: Click any `.sprite` file in VS Code
2. **Auto-viewer**: The D2R Sprite Viewer opens automatically
3. **Interactive controls**: Use mouse wheel to zoom, drag to pan

## Controls

| Button | Function | Description |
|--------|----------|-------------|
| 🏁 **Transparency Grid** | Toggle background | Show/hide checkerboard pattern |
| 🔍 **Reset Zoom** | Reset to 100% | Return to original size |
| 🎨 **Edit in Paint.NET** | External editor | Launch Paint.NET with auto-sync |
| 📤 **Export to PNG** | Save as PNG | Convert sprite to PNG format |
| 📥 **Import from PNG** | Load from PNG | Update sprite from PNG file |

## Installation

1. Install from VS Code Marketplace
2. Open any `.sprite` file
3. The viewer launches automatically

## External Editing Workflow

1. Click **"Edit in Paint.NET"** 
2. Paint.NET opens with the sprite as PNG
3. Make your edits and save
4. The sprite file updates automatically
5. View changes instantly in VS Code

## Requirements

- **VS Code**: 1.48.0 or higher
- **Paint.NET**: Optional, for external editing

## Technical Details

- **Format Support**: D2R SpA1/SPa1 sprite format
- **Pixel Format**: BGRA with transparency
- **Max Dimensions**: 4096x4096 pixels
- **Performance**: Optimized for large sprites (tested up to 512x512)

## License

MIT License - see [LICENSE](LICENSE) for details

## Contributing

1. Fork the repository
2. Create a feature branch
3. Submit a pull request

## Support

For issues or questions:
- [GitHub Issues](https://github.com/bethington/vscode-sprite-editor-extension/issues)
- [VS Code Marketplace](https://marketplace.visualstudio.com/items?itemName=d2rmodding.d2r-sprite-editor-2025)

## Current Limitations

- No resize functionality
- No selection or move tools
- No palette creation or saving
- Missing most basic features expected in pixel art tools

## Known Issues

- Flood fill may leave gaps
- Undo history is unreliable
- Overall stability is questionable

## Bug Reports

- Bug reports are appreciated, but I may not have the motivation to fix them
- Pull requests with fixes are very welcome!

## Build Instructions

- yarn
- yarn watch:front
- Open in VSCode and press F5 to run
- Reload required when editing files in the front/ directory
