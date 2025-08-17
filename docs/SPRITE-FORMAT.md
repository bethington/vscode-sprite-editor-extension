# D2R Sprite Format Specification

## Overview

D2R (Diablo 2 Resurrected) sprite files use a custom binary format for storing game sprites with transparency support. The format supports both single-frame and multi-frame sprite animations with variable header sizes.

## File Format Structure

### Header (Variable size, minimum 40 bytes)

| Offset | Size | Type | Description |
|--------|------|------|-------------|
| 0x00 | 4 | ASCII | Magic signature: "SpA1" or "SPa1" |
| 0x04 | 2 | uint16 | Version number |
| 0x06 | 2 | uint16 | Unused/padding |
| 0x08 | 4 | int32 | Total width in pixels (all frames combined) |
| 0x0C | 4 | int32 | Frame height in pixels (height of individual frame) |
| 0x10 | 4 | int32 | Unknown field |
| 0x14 | 4 | uint32 | Frame count (1 for single frame sprites) |
| 0x18 | 8 | bytes | Additional header data |
| 0x20-0x27 | 8 | bytes | Extended header padding |
| Variable | Variable | bytes | Extended metadata (palette, etc.) - some files only |

### Multi-Frame Support

- **Single Frame**: frameCount = 1, frameHeight = totalHeight
- **Multi-Frame**: frameCount > 1, frameHeight = height per individual frame
- **Frame Data**: All frames stored consecutively in pixel data section
- **Frame Size**: Each frame is width × frameHeight × 4 bytes

### Pixel Data (Variable offset and length)

- **Format**: RGBA (Red, Green, Blue, Alpha) - stored as RGBA in sprite files
- **Bit Depth**: 32-bit (8 bits per channel)
- **Size**: frameCount × totalWidth × frameHeight × 4 bytes
- **Offset**: Fixed at 0x28 (40 bytes) - pixel data starts here
- **Frame Layout**: All frames stored consecutively without padding

## Magic Signatures

| Signature | Description |
|-----------|-------------|
| `SpA1` | Standard D2R sprite format |
| `SPa1` | Alternative D2R sprite format |

## Pixel Format Details

### RGBA Layout
Each pixel is stored as 4 consecutive bytes:
```
[Red] [Green] [Blue] [Alpha]
```

### Alpha Channel
- `0x00` = Fully transparent
- `0xFF` = Fully opaque
- Values between = Partial transparency

## Validation Rules

### Header Validation

- Magic must be "SpA1" or "SPa1"
- Width and height must be > 0
- Dimensions should not exceed 16384×16384 (increased from 4096×4096)
- Frame count must be ≥ 1
- For multi-frame sprites: totalHeight = frameCount × frameHeight
- File size must match: header_size + (frameCount × width × frameHeight × 4)

### Pixel Data Validation

- Must contain exactly frameCount × width × frameHeight pixels
- Each pixel must be 4 bytes (BGRA)
- Alpha values can be any value 0-255
- Pixel data offset determined dynamically by scanning for correct data size

### Multi-Frame Validation

- Single frame: frameCount = 1, frameHeight = totalHeight
- Multi-frame: frameCount > 1, frameHeight < totalHeight
- Total pixel data = frameCount × width × frameHeight × 4 bytes
- All frames stored consecutively without padding

## Conversion to PNG

### Color Space Conversion
D2R sprites use RGBA format, same as PNG format (no conversion needed):
```
PNG_Red   = Sprite_Red
PNG_Green = Sprite_Green  
PNG_Blue  = Sprite_Blue
PNG_Alpha = Sprite_Alpha
```

### Transparency Handling
- PNG alpha channel directly maps to sprite alpha
- Transparent pixels (alpha=0) are preserved
- Semi-transparent pixels maintain their alpha values

## Example File Structures

### Single Frame Sprite
```
File: 1862x15_1_frame.sprite (111,760 bytes)

Header (40 bytes):
0x00: 53 70 41 31  ("SpA1")
0x04: 01 00        (version = 1)
0x06: 00 00        (padding/unused)
0x08: 46 07 00 00  (totalWidth = 1862)
0x0C: 0F 00 00 00  (frameHeight = 15)
0x10: 00 00 00 00  (unknown)
0x14: 01 00 00 00  (frameCount = 1)
0x18: 00 00 00...  (8 bytes additional header)

Pixel Data (111,720 bytes):
0x28: [R][G][B][A] [R][G][B][A] ... (1862×15×4 = 111,720 bytes)
```

### Multi-Frame Sprite
```
File: 88x20_51_frames.sprite (359,080 bytes)

Header (40 bytes):
0x00: 53 70 41 31  ("SpA1")
0x04: 1F 00        (version = 31)
0x06: 00 00        (padding/unused)
0x08: 98 11 00 00  (totalWidth = 4504 = 88×51 frames)
0x0C: 14 00 00 00  (frameHeight = 20)
0x10: 00 00 00 00  (unknown)
0x14: 33 00 00 00  (frameCount = 51)
0x18: 00 00 00...  (8 bytes additional header)

Pixel Data (359,040 bytes):
0x28: [Frame 0: 88×20×4 bytes][Frame 1: 88×20×4 bytes]...[Frame 50: 88×20×4 bytes]
      Total: 51 frames × 88×20×4 = 359,040 bytes
```

### Extended Header Sprite
```
File: 315x80_4_frames.sprite (404,200 bytes)

Header (1000 bytes):
0x00: 53 70 41 31  ("SpA1")
0x04: 1F 00        (version = 31)
0x06: 00 00        (padding/unused)
0x08: EC 04 00 00  (totalWidth = 1260 = 315×4 frames)
0x0C: 50 00 00 00  (frameHeight = 80)
0x10: 00 00 00 00  (unknown)
0x14: 04 00 00 00  (frameCount = 4)
0x18: 00 00 00...  (8 bytes standard header)
0x28: ...          (960 bytes extended metadata - palette/etc)

Pixel Data (403,200 bytes):
0x3E8: [Frame 0][Frame 1][Frame 2][Frame 3]
       Total: 4 frames × 315×80×4 = 403,200 bytes
```

## Implementation Notes

### Reading Sprites
1. Verify magic signature
2. Parse header dimensions
3. Validate file size
4. Extract pixel data starting at offset 0x28
5. Convert BGRA to RGBA for display

### Writing Sprites
1. Preserve original header structure
2. Convert RGBA to BGRA format
3. Write header with correct dimensions
4. Append pixel data at offset 0x28
5. Ensure file size matches expected length

### Performance Considerations
- Large sprites (512×512) = ~1MB files
- Buffer operations should be optimized
- Consider streaming for very large files
- Memory management important for batch processing

## Common Issues

### Invalid Magic
- Files may have corrupted headers
- Non-D2R files with .sprite extension
- Binary editors may modify magic bytes

### Dimension Mismatches
- Header dimensions don't match pixel data size
- Truncated files missing pixel data
- Invalid width/height values (0 or negative)

### Color Corruption
- Incorrect BGRA/RGBA conversion
- Endianness issues on different platforms
- Alpha channel not preserved properly

## Tools and Libraries

### Node.js Canvas
Used for PNG conversion:
```javascript
const canvas = createCanvas(width, height);
const ctx = canvas.getContext('2d');
const imageData = ctx.createImageData(width, height);
imageData.data.set(rgbaData);
ctx.putImageData(imageData, 0, 0);
const pngBuffer = canvas.toBuffer('image/png');
```

### Buffer Operations
Efficient binary data handling:
```javascript
// Read header (ExampleJS algorithm)
const magic = buffer.toString('ascii', 0, 4);
const totalWidth = buffer.readInt32LE(8);    // Total width (all frames)
const frameHeight = buffer.readInt32LE(12);  // Individual frame height
const frameCount = buffer.readUInt32LE(20);  // Number of frames

// Extract pixel data (starts at fixed offset 0x28)
const pixelDataOffset = 0x28;
const pixelData = buffer.slice(pixelDataOffset);
```

## References

- [Canvas API Documentation](https://developer.mozilla.org/en-US/docs/Web/API/Canvas_API)
- [Node.js Buffer Documentation](https://nodejs.org/api/buffer.html)
- [PNG Specification](https://www.w3.org/TR/PNG/)
