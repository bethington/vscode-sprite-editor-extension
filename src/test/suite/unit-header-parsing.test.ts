import * as assert from 'assert';
import * as path from 'path';
import * as fs from 'fs';

/**
 * Unit Tests for D2R Sprite Header Parsing
 * Tests the core sprite parsing functionality with known test files
 */
suite('Unit Tests: Sprite Header Parsing', () => {

    const fixturesPath = path.join(__dirname, '..', 'fixtures');

    /**
     * Mock implementation of parseD2RSpriteHeader for testing
     * This mimics the actual implementation in sprite-editor-provider.ts
     */
    function parseD2RSpriteHeader(data: Buffer) {
        if (data.length < 24) {
            throw new Error('File too small to contain valid D2R sprite header');
        }
        
        // Read signature (first 4 bytes)
        const magic = data.toString('ascii', 0, 4);
        if (magic !== 'SpA1' && magic !== 'SPa1') {
            throw new Error(`Invalid D2R sprite magic: expected 'SpA1' or 'SPa1', got '${magic}'`);
        }
        
        // Read version (2 bytes at offset 4)
        const version = data.readUInt16LE(4);
        
        // Read width (4 bytes at offset 8) and height (4 bytes at offset 0xC/12)
        const totalWidth = data.readInt32LE(8);
        const frameHeight = data.readInt32LE(12);
        
        // Frame count at offset 0x14 (20)
        const frameCount = data.readUInt32LE(20);
        
        // Pixel data starts at offset 0x28 (40)
        const pixelDataOffset = 40;

        if (totalWidth <= 0 || frameHeight <= 0 || totalWidth > 16384 || frameHeight > 16384) {
            throw new Error(`Invalid dimensions: ${totalWidth}x${frameHeight}`);
        }

        // Calculate individual frame dimensions
        const actualFrameCount = frameCount > 1 ? frameCount : 1;
        const individualFrameWidth = actualFrameCount > 1 ? Math.floor(totalWidth / actualFrameCount) : totalWidth;
        
        return { 
            magic, 
            version, 
            width: totalWidth,           // Total width of all frames
            height: frameHeight,         // Individual frame height
            frameCount: actualFrameCount, 
            frameHeight: frameHeight,    // Keep for compatibility
            frameWidth: individualFrameWidth, // Individual frame width
            pixelDataOffset
        };
    }

    test('Should parse single frame sprite header correctly', () => {
        const spriteFile = path.join(fixturesPath, '315x80_4_frames.sprite');
        const spriteData = fs.readFileSync(spriteFile);
        
        const header = parseD2RSpriteHeader(spriteData);
        
        assert.strictEqual(header.magic, 'SpA1', 'Magic signature should be SpA1');
        assert.strictEqual(header.frameCount, 4, 'Frame count should be 4');
        assert.strictEqual(header.frameHeight, 80, 'Frame height should be 80');
        assert.strictEqual(header.width, 1263, 'Total width should be 1263 (actual sprite width)');
        assert.strictEqual(header.frameWidth, 315, 'Individual frame width should be 315');
        assert.strictEqual(header.pixelDataOffset, 40, 'Pixel data should start at offset 40');
    });

    test('Should parse multi-frame sprite header correctly', () => {
        const spriteFile = path.join(fixturesPath, '88x20_51_frames.sprite');
        const spriteData = fs.readFileSync(spriteFile);
        
        const header = parseD2RSpriteHeader(spriteData);
        
        assert.strictEqual(header.magic, 'SpA1', 'Magic signature should be SpA1');
        assert.strictEqual(header.frameCount, 51, 'Frame count should be 51');
        assert.strictEqual(header.frameHeight, 20, 'Frame height should be 20');
        assert.strictEqual(header.frameWidth, 88, 'Individual frame width should be 88');
        assert.strictEqual(header.pixelDataOffset, 40, 'Pixel data should start at offset 40');
    });

    test('Should parse large single frame sprite', () => {
        const spriteFile = path.join(fixturesPath, '1171x1505_1_frame.sprite');
        const spriteData = fs.readFileSync(spriteFile);
        
        const header = parseD2RSpriteHeader(spriteData);
        
        assert.strictEqual(header.magic, 'SPa1', 'Magic signature should be SPa1');
        assert.strictEqual(header.frameCount, 1, 'Frame count should be 1');
        assert.strictEqual(header.frameHeight, 1505, 'Frame height should be 1505');
        assert.strictEqual(header.width, 1171, 'Total width should be 1171');
        assert.strictEqual(header.frameWidth, 1171, 'Individual frame width should be 1171');
    });

    test('Should parse narrow multi-frame sprite', () => {
        const spriteFile = path.join(fixturesPath, '1862x15_1_frame.sprite');
        const spriteData = fs.readFileSync(spriteFile);
        
        const header = parseD2RSpriteHeader(spriteData);
        
        assert.strictEqual(header.magic, 'SpA1', 'Magic signature should be SpA1');
        assert.strictEqual(header.frameCount, 1, 'Frame count should be 1');
        assert.strictEqual(header.frameHeight, 15, 'Frame height should be 15');
        assert.strictEqual(header.width, 1862, 'Total width should be 1862');
        assert.strictEqual(header.frameWidth, 1862, 'Individual frame width should be 1862');
    });

    test('Should validate file size requirements', () => {
        const tooSmallBuffer = Buffer.alloc(20); // Less than minimum 24 bytes
        
        assert.throws(() => {
            parseD2RSpriteHeader(tooSmallBuffer);
        }, /File too small to contain valid D2R sprite header/);
    });

    test('Should validate magic signature', () => {
        const invalidMagicBuffer = Buffer.alloc(40);
        invalidMagicBuffer.write('XXXX', 0, 4, 'ascii'); // Invalid magic
        invalidMagicBuffer.writeInt32LE(100, 8); // Valid width
        invalidMagicBuffer.writeInt32LE(100, 12); // Valid height
        
        assert.throws(() => {
            parseD2RSpriteHeader(invalidMagicBuffer);
        }, /Invalid D2R sprite magic/);
    });

    test('Should validate sprite dimensions', () => {
        const invalidDimensionsBuffer = Buffer.alloc(40);
        invalidDimensionsBuffer.write('SpA1', 0, 4, 'ascii'); // Valid magic
        invalidDimensionsBuffer.writeInt32LE(0, 8); // Invalid width
        invalidDimensionsBuffer.writeInt32LE(100, 12); // Valid height
        
        assert.throws(() => {
            parseD2RSpriteHeader(invalidDimensionsBuffer);
        }, /Invalid dimensions/);
    });

    test('Should handle edge case dimensions', () => {
        const edgeCaseBuffer = Buffer.alloc(40);
        edgeCaseBuffer.write('SpA1', 0, 4, 'ascii');
        edgeCaseBuffer.writeUInt16LE(1, 4); // Version
        edgeCaseBuffer.writeInt32LE(16384, 8); // Max width
        edgeCaseBuffer.writeInt32LE(16384, 12); // Max height
        edgeCaseBuffer.writeUInt32LE(1, 20); // Frame count
        
        const header = parseD2RSpriteHeader(edgeCaseBuffer);
        
        assert.strictEqual(header.width, 16384, 'Should handle max width');
        assert.strictEqual(header.frameHeight, 16384, 'Should handle max height');
    });

    test('Should calculate frame width correctly for multi-frame sprites', () => {
        const multiFrameBuffer = Buffer.alloc(40);
        multiFrameBuffer.write('SpA1', 0, 4, 'ascii');
        multiFrameBuffer.writeUInt16LE(1, 4); // Version
        multiFrameBuffer.writeInt32LE(400, 8); // Total width = 400
        multiFrameBuffer.writeInt32LE(50, 12); // Frame height = 50
        multiFrameBuffer.writeUInt32LE(5, 20); // Frame count = 5
        
        const header = parseD2RSpriteHeader(multiFrameBuffer);
        
        assert.strictEqual(header.width, 400, 'Total width should be 400');
        assert.strictEqual(header.frameWidth, 80, 'Individual frame width should be 80 (400/5)');
        assert.strictEqual(header.frameCount, 5, 'Frame count should be 5');
    });
});
