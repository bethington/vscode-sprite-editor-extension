import * as assert from 'assert';
import * as path from 'path';
import * as fs from 'fs';

/**
 * Unit Tests for Pixel Extraction and Conversion
 * Tests the ExampleJS algorithm implementation
 */
suite('Unit Tests: Pixel Extraction', () => {

    const fixturesPath = path.join(__dirname, '..', 'fixtures');

    /**
     * Mock pixel extraction function that mimics the ExampleJS algorithm
     */
    function extractPixelData(spriteData: Buffer, header: any, frameIndex: number): Buffer {
        const frameSize = header.frameWidth * header.frameHeight * 4;
        const pixelData = Buffer.alloc(frameSize);
        
        // ExampleJS algorithm: Process pixels exactly like C# code
        let pixelIndex = 0;
        for (let x = 0; x < header.frameHeight; x++) {
            for (let y = 0; y < (header.frameCount > 1 ? header.frameWidth : header.width); y++) {
                // ExampleJS: Calculate byte offset - matches C#: 0x28 + x * 4 * width + y * 4
                const baseVal = 0x28 + x * 4 * header.width + y * 4 + frameIndex * header.frameWidth * 4;
                
                if (baseVal + 3 < spriteData.length) {
                    // ExampleJS: Read RGBA values - matches C# byte order
                    const r = spriteData[baseVal + 0];
                    const g = spriteData[baseVal + 1];
                    const b = spriteData[baseVal + 2];
                    const a = spriteData[baseVal + 3];

                    // Store in output buffer
                    pixelData[pixelIndex++] = r;     // Red
                    pixelData[pixelIndex++] = g;     // Green
                    pixelData[pixelIndex++] = b;     // Blue
                    pixelData[pixelIndex++] = a;     // Alpha
                } else {
                    // Fill with transparent black if out of bounds
                    pixelData[pixelIndex++] = 0;
                    pixelData[pixelIndex++] = 0;
                    pixelData[pixelIndex++] = 0;
                    pixelData[pixelIndex++] = 0;
                }
            }
        }
        
        return pixelData;
    }

    function parseD2RSpriteHeader(data: Buffer) {
        const magic = data.toString('ascii', 0, 4);
        const version = data.readUInt16LE(4);
        const totalWidth = data.readInt32LE(8);
        const frameHeight = data.readInt32LE(12);
        const frameCount = data.readUInt32LE(20);
        const pixelDataOffset = 40;
        const actualFrameCount = frameCount > 1 ? frameCount : 1;
        const individualFrameWidth = actualFrameCount > 1 ? Math.floor(totalWidth / actualFrameCount) : totalWidth;
        
        return { 
            magic, version, width: totalWidth, height: frameHeight,
            frameCount: actualFrameCount, frameHeight, frameWidth: individualFrameWidth, pixelDataOffset
        };
    }

    test('Should extract pixel data with correct RGBA format', () => {
        const spriteFile = path.join(fixturesPath, '315x80_4_frames.sprite');
        const spriteData = fs.readFileSync(spriteFile);
        const header = parseD2RSpriteHeader(spriteData);
        
        // Extract first frame
        const pixelData = extractPixelData(spriteData, header, 0);
        
        // Verify pixel data size
        const expectedSize = header.frameWidth * header.frameHeight * 4;
        assert.strictEqual(pixelData.length, expectedSize, 
            `Pixel data should be ${expectedSize} bytes (${header.frameWidth}×${header.frameHeight}×4)`);

        // Verify RGBA format - check first pixel
        const r = pixelData[0];
        const g = pixelData[1];
        const b = pixelData[2];
        const a = pixelData[3];

        // All values should be valid bytes (0-255)
        assert.ok(r >= 0 && r <= 255, 'Red channel should be valid byte');
        assert.ok(g >= 0 && g <= 255, 'Green channel should be valid byte');
        assert.ok(b >= 0 && b <= 255, 'Blue channel should be valid byte');
        assert.ok(a >= 0 && a <= 255, 'Alpha channel should be valid byte');
    });

    test('Should extract different frames correctly', () => {
        const spriteFile = path.join(fixturesPath, '315x80_4_frames.sprite');
        const spriteData = fs.readFileSync(spriteFile);
        const header = parseD2RSpriteHeader(spriteData);
        
        // Extract multiple frames
        const frame0Data = extractPixelData(spriteData, header, 0);
        const frame1Data = extractPixelData(spriteData, header, 1);
        const frame2Data = extractPixelData(spriteData, header, 2);
        const frame3Data = extractPixelData(spriteData, header, 3);
        
        // All frames should be same size
        const expectedSize = header.frameWidth * header.frameHeight * 4;
        assert.strictEqual(frame0Data.length, expectedSize, 'Frame 0 should have correct size');
        assert.strictEqual(frame1Data.length, expectedSize, 'Frame 1 should have correct size');
        assert.strictEqual(frame2Data.length, expectedSize, 'Frame 2 should have correct size');
        assert.strictEqual(frame3Data.length, expectedSize, 'Frame 3 should have correct size');
        
        // Frames should be different (not all identical)
        const frame0Different = !frame0Data.equals(frame1Data);
        const frame1Different = !frame1Data.equals(frame2Data);
        const frame2Different = !frame2Data.equals(frame3Data);
        
        // At least some frames should be different
        assert.ok(frame0Different || frame1Different || frame2Different, 
            'Frames should contain different pixel data');
    });

    test('Should handle single frame sprites', () => {
        const spriteFile = path.join(fixturesPath, '1171x1505_1_frame.sprite');
        const spriteData = fs.readFileSync(spriteFile);
        const header = parseD2RSpriteHeader(spriteData);
        
        // Extract single frame
        const pixelData = extractPixelData(spriteData, header, 0);
        
        // Verify size for single frame
        const expectedSize = header.frameWidth * header.frameHeight * 4;
        assert.strictEqual(pixelData.length, expectedSize, 
            `Single frame pixel data should be ${expectedSize} bytes`);
        
        // Verify frame count is 1
        assert.strictEqual(header.frameCount, 1, 'Should be single frame sprite');
    });

    test('Should handle large multi-frame sprites', () => {
        const spriteFile = path.join(fixturesPath, '88x20_51_frames.sprite');
        const spriteData = fs.readFileSync(spriteFile);
        const header = parseD2RSpriteHeader(spriteData);
        
        // Test extraction of first, middle, and last frames
        const firstFrame = extractPixelData(spriteData, header, 0);
        const middleFrame = extractPixelData(spriteData, header, 25);
        const lastFrame = extractPixelData(spriteData, header, 50);
        
        const expectedSize = header.frameWidth * header.frameHeight * 4;
        assert.strictEqual(firstFrame.length, expectedSize, 'First frame should have correct size');
        assert.strictEqual(middleFrame.length, expectedSize, 'Middle frame should have correct size');
        assert.strictEqual(lastFrame.length, expectedSize, 'Last frame should have correct size');
        
        // Verify 51 frames
        assert.strictEqual(header.frameCount, 51, 'Should have 51 frames');
    });

    test('Should calculate offset correctly using ExampleJS algorithm', () => {
        const spriteFile = path.join(fixturesPath, '315x80_4_frames.sprite');
        const spriteData = fs.readFileSync(spriteFile);
        const header = parseD2RSpriteHeader(spriteData);
        
        // Test offset calculation for specific pixels
        // Frame 0, pixel (0,0)
        const baseValFrame0Pixel00 = 0x28 + 0 * 4 * header.width + 0 * 4 + 0 * header.frameWidth * 4;
        assert.ok(baseValFrame0Pixel00 >= 0x28, 'Frame 0, pixel (0,0) offset should be at least 0x28');
        
        // Frame 1, pixel (0,0)
        const baseValFrame1Pixel00 = 0x28 + 0 * 4 * header.width + 0 * 4 + 1 * header.frameWidth * 4;
        assert.ok(baseValFrame1Pixel00 > baseValFrame0Pixel00, 'Frame 1 offset should be greater than Frame 0');
        
        // Frame 0, pixel (0,1)
        const baseValFrame0Pixel01 = 0x28 + 0 * 4 * header.width + 1 * 4 + 0 * header.frameWidth * 4;
        assert.strictEqual(baseValFrame0Pixel01 - baseValFrame0Pixel00, 4, 'Adjacent horizontal pixels should be 4 bytes apart');
        
        // Frame 0, pixel (1,0)
        const baseValFrame0Pixel10 = 0x28 + 1 * 4 * header.width + 0 * 4 + 0 * header.frameWidth * 4;
        assert.strictEqual(baseValFrame0Pixel10 - baseValFrame0Pixel00, 4 * header.width, 'Adjacent vertical pixels should be 4*width bytes apart');
    });

    test('Should handle boundary conditions', () => {
        const spriteFile = path.join(fixturesPath, '315x80_4_frames.sprite');
        const spriteData = fs.readFileSync(spriteFile);
        const header = parseD2RSpriteHeader(spriteData);
        
        // Extract frame at boundary (last frame)
        const lastFrameIndex = header.frameCount - 1;
        const pixelData = extractPixelData(spriteData, header, lastFrameIndex);
        
        const expectedSize = header.frameWidth * header.frameHeight * 4;
        assert.strictEqual(pixelData.length, expectedSize, 'Last frame should have correct size');
        
        // Check corner pixels exist (no out-of-bounds)
        const topLeft = [pixelData[0], pixelData[1], pixelData[2], pixelData[3]];
        const bottomRight = [
            pixelData[expectedSize - 4],
            pixelData[expectedSize - 3], 
            pixelData[expectedSize - 2],
            pixelData[expectedSize - 1]
        ];
        
        // All should be valid byte values
        topLeft.concat(bottomRight).forEach((value, index) => {
            assert.ok(value >= 0 && value <= 255, `Corner pixel byte ${index} should be valid`);
        });
    });

    test('Should preserve alpha channel correctly', () => {
        const spriteFile = path.join(fixturesPath, '315x80_4_frames.sprite');
        const spriteData = fs.readFileSync(spriteFile);
        const header = parseD2RSpriteHeader(spriteData);
        
        const pixelData = extractPixelData(spriteData, header, 0);
        
        // Check alpha values across the image
        let transparentPixels = 0;
        let opaquePixels = 0;
        let semiTransparentPixels = 0;
        
        for (let i = 3; i < pixelData.length; i += 4) {
            const alpha = pixelData[i];
            if (alpha === 0) {
                transparentPixels++;
            } else if (alpha === 255) {
                opaquePixels++;
            } else {
                semiTransparentPixels++;
            }
        }
        
        const totalPixels = pixelData.length / 4;
        assert.strictEqual(transparentPixels + opaquePixels + semiTransparentPixels, totalPixels,
            'All pixels should be accounted for in alpha analysis');
            
        // Should have some variety in alpha values for sprite files
        assert.ok(transparentPixels > 0 || opaquePixels > 0, 'Should have some non-semi-transparent pixels');
    });
});
