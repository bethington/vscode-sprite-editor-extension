# D2R Sprite Format Specification

## Overview

D2R (Diablo 2 Resurrected) sprite files use a custom binary format for storing game sprites with transparency support.

## File Format Structure

### Header (40 bytes - 0x28)

| Offset | Size | Type | Description |
|--------|------|------|-------------|
| 0x00 | 4 | ASCII | Magic signature: "SpA1" or "SPa1" |
| 0x04 | 2 | uint16 | Version number |
| 0x06 | 2 | uint16 | Image width in pixels |
| 0x08 | 2 | uint16 | Image height in pixels |
| 0x0A | 30 | bytes | Reserved/metadata fields |

### Pixel Data (Variable length)

- **Format**: BGRA (Blue, Green, Red, Alpha)
- **Bit Depth**: 32-bit (8 bits per channel)
- **Size**: width × height × 4 bytes
- **Offset**: Starts at 0x28 (after header)

## Magic Signatures

| Signature | Description |
|-----------|-------------|
| `SpA1` | Standard D2R sprite format |
| `SPa1` | Alternative D2R sprite format |

## Pixel Format Details

### BGRA Layout
Each pixel is stored as 4 consecutive bytes:
```
[Blue] [Green] [Red] [Alpha]
```

### Alpha Channel
- `0x00` = Fully transparent
- `0xFF` = Fully opaque
- Values between = Partial transparency

## Validation Rules

### Header Validation
- Magic must be "SpA1" or "SPa1"
- Width and height must be > 0
- Dimensions should not exceed 4096×4096
- File size must match: header_size + (width × height × 4)

### Pixel Data Validation
- Must contain exactly width × height pixels
- Each pixel must be 4 bytes (BGRA)
- Alpha values can be any value 0-255

## Conversion to PNG

### Color Space Conversion
D2R sprites use BGRA format, while PNG typically uses RGBA:
```
PNG_Red   = Sprite_Blue
PNG_Green = Sprite_Green  
PNG_Blue  = Sprite_Red
PNG_Alpha = Sprite_Alpha
```

### Transparency Handling
- PNG alpha channel directly maps to sprite alpha
- Transparent pixels (alpha=0) are preserved
- Semi-transparent pixels maintain their alpha values

## Example File Structure

```
File: example.sprite (16,424 bytes)

Header (40 bytes):
0x00: 53 70 41 31  ("SpA1")
0x04: 01 00        (version = 1)
0x06: 40 00        (width = 64)
0x08: 40 00        (height = 64)
0x0A: 00 00 00...  (30 bytes reserved)

Pixel Data (16,384 bytes):
0x28: [B][G][R][A] [B][G][R][A] ... (64×64×4 = 16,384 bytes)
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
// Read header
const magic = buffer.toString('ascii', 0, 4);
const width = buffer.readUInt16LE(6);
const height = buffer.readUInt16LE(8);

// Extract pixel data
const pixelData = buffer.slice(0x28, 0x28 + (width * height * 4));
```

## References

- [Canvas API Documentation](https://developer.mozilla.org/en-US/docs/Web/API/Canvas_API)
- [Node.js Buffer Documentation](https://nodejs.org/api/buffer.html)
- [PNG Specification](https://www.w3.org/TR/PNG/)
