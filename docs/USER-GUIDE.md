# User Guide

## Getting Started

### Installation
1. Open VS Code
2. Go to Extensions (Ctrl+Shift+X)
3. Search for "D2R Sprite Editor"
4. Click Install

### Opening Sprite Files
The extension automatically handles `.sprite` files:
- **Single click** any `.sprite` file in the Explorer
- The D2R Sprite Viewer opens automatically
- No additional setup required

## Interface Overview

### Main Viewer
- **Image Display**: Pixelated rendering optimized for sprite art
- **Transparency Grid**: Checkerboard background for transparent areas
- **Zoom Controls**: Mouse wheel to zoom in/out
- **Pan Support**: Drag to move around large sprites

### Control Panel
Located below the image display:

| Button | Icon | Function |
|--------|------|----------|
| Previous Frame | ⏮️ | Navigate to previous frame (multi-frame sprites only) |
| Next Frame | ⏭️ | Navigate to next frame (multi-frame sprites only) |
| Transparency Grid | 🏁 | Toggle checkerboard background |
| Reset Zoom | 🔍 | Return to 100% zoom level |
| Edit in Paint.NET | 🎨 | Open external editor |
| Export to PNG | 📤 | Save sprite as PNG file |
| Import from PNG | 📥 | Update sprite from PNG |

### Frame Information
For multi-frame sprites, displays:
- **Current Frame**: Frame number (1-based)
- **Total Frames**: Total number of frames in the sprite
- **Navigation Controls**: Only visible for sprites with more than 1 frame

### Information Panel
Shows file details:
- **File name**: Current sprite file
- **Dimensions**: Width × height in pixels per frame
- **Frame Count**: Number of frames (1 for static sprites)
- **Format**: D2R Sprite (SpA1/SPa1)
- **Controls**: Usage instructions

## Basic Operations

### Viewing Sprites
1. **Open file**: Click any `.sprite` file
2. **Zoom**: Use mouse wheel to zoom in/out
3. **Pan**: Click and drag to move around
4. **Reset view**: Click "Reset Zoom" button

### Multi-Frame Navigation
For sprites with multiple frames:
1. **Frame controls**: Previous/Next buttons appear automatically
2. **Keyboard shortcuts**: Use ← and → arrow keys to navigate
3. **Frame counter**: Shows "Frame X of Y" in the control panel
4. **Automatic detection**: Multi-frame sprites are detected automatically

### Transparency
- **Toggle grid**: Click "Transparency Grid" button
- **Grid pattern**: Checkerboard shows transparent areas
- **Alpha support**: Full transparency support

## External Editing Workflow

### Using Paint.NET

#### Setup (First Time)
1. Install Paint.NET (free from getpaint.net)
2. Ensure Paint.NET is in default location:
   - `C:\Program Files\paint.net\paintdotnet.exe`

#### Editing Process
1. Click **"Edit in Paint.NET"** button
2. Paint.NET opens with sprite as PNG
3. Make your edits in Paint.NET
4. **Save the PNG** (Ctrl+S)
5. Sprite automatically updates in VS Code
6. View changes instantly

#### Important Notes
- **Don't change dimensions**: Keep original width/height
- **Save frequently**: Each save updates the sprite
- **Use PNG format**: Don't change file format
- **Maintain transparency**: Alpha channel is preserved

### File Watching
The extension automatically watches for changes:
- Detects when PNG is saved
- Converts PNG back to sprite format
- Updates the viewer in real-time
- Creates backup files (.sprite.backup)

## PNG Conversion

### Export to PNG
1. Click **"Export to PNG"** button
2. PNG file created next to sprite file
3. Same name with `.png` extension
4. Ready for external editing

### Import from PNG
1. Click **"Import from PNG"** button
2. File picker opens
3. Select PNG file to import
4. Sprite file updates with PNG data

### Format Requirements
- **Dimensions**: Must match original sprite size
- **Color format**: RGBA or RGB with transparency
- **File format**: Standard PNG
- **Alpha channel**: Preserved for transparency

## Troubleshooting

### Paint.NET Issues

#### "Paint.NET not found"
- **Check installation**: Verify Paint.NET is installed
- **Check path**: Ensure it's in `C:\Program Files\paint.net\`
- **Alternative**: Try manual PNG export/import

#### "File not updating"
- **Save the PNG**: Ensure you save in Paint.NET
- **Check file size**: Verify PNG was actually saved
- **Restart process**: Close Paint.NET and try again

### Performance Issues

#### Large Files (>500KB)
- **Zoom carefully**: Large zooms can be slow
- **Memory usage**: Close other extensions if needed
- **File size**: Consider if sprite is too large

#### Slow PNG conversion
- **File complexity**: Complex sprites take longer
- **System performance**: Ensure adequate RAM
- **Background processes**: Close unnecessary apps

### File Format Issues

#### "Invalid sprite file"
- **Check format**: Ensure it's a D2R sprite file
- **File corruption**: Try opening original backup
- **Magic signature**: File may not be valid D2R format

#### "Dimension mismatch"
- **PNG size**: Ensure PNG matches sprite dimensions
- **Import process**: Try export/edit/import workflow
- **File validation**: Check sprite file isn't corrupted

## Best Practices

### File Management
- **Keep backups**: Extension creates .backup files
- **Organized folders**: Group sprites by type/character
- **Version control**: Use Git for sprite projects

### Editing Workflow
1. **Export first**: Always export to PNG before editing
2. **Edit externally**: Use Paint.NET or similar tools
3. **Save frequently**: Each save updates the sprite
4. **Check results**: Verify changes in VS Code viewer

### Performance Tips
- **Close unused files**: Don't keep many sprites open
- **Reasonable sizes**: Very large sprites (>1000px) can be slow
- **System resources**: Ensure adequate RAM available

## Keyboard Shortcuts

| Action | Shortcut | Description |
|--------|----------|-------------|
| Zoom In | Mouse Wheel Up | Increase zoom level |
| Zoom Out | Mouse Wheel Down | Decrease zoom level |
| Pan | Mouse Drag | Move view around |
| Open File | Click | Open sprite in viewer |

## File Support

### Supported Formats
- **D2R Sprites**: `.sprite` files (SpA1/SPa1 format)
- **PNG Export**: Standard PNG with transparency
- **Dimensions**: Up to 4096×4096 pixels

### Not Supported
- Other sprite formats (DDS, TGA, etc.)
- Animated sprites
- Compressed sprite formats
- Non-D2R sprite files

## Getting Help

### Documentation
- **This guide**: Complete user instructions
- **Development docs**: `docs/DEVELOPMENT.md`
- **Format specs**: `docs/SPRITE-FORMAT.md`

### Support Channels
- **GitHub Issues**: Report bugs and feature requests
- **VS Code Marketplace**: Extension page and reviews
- **Documentation**: Built-in help and guides

### Common Questions

**Q: Can I edit sprites directly in VS Code?**
A: No, the extension is a viewer. Use Paint.NET for editing.

**Q: What file sizes are supported?**
A: Up to 4096×4096 pixels. Tested extensively with 512×512.

**Q: Does it work with other image editors?**
A: Paint.NET is officially supported. Other editors may work with manual export/import.

**Q: Can I batch convert sprites?**
A: Not currently. Each sprite must be converted individually.

**Q: Are animated sprites supported?**
A: No, only static sprites are supported.
