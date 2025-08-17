import * as assert from 'assert';
import * as path from 'path';
import * as fs from 'fs';

/**
 * Performance Tests: Memory Usage and Processing Speed
 * Tests the performance characteristics of sprite processing using ExampleJS algorithm
 */
suite('Performance Tests: Speed and Memory', () => {

    const fixturesPath = path.join(__dirname, '..', 'fixtures');

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

    function measureMemoryUsage(): { used: number; total: number } {
        const memUsage = process.memoryUsage();
        return {
            used: memUsage.heapUsed,
            total: memUsage.heapTotal
        };
    }

    function processSpriteFast(spriteData: Buffer, header: any, frameIndex: number): Buffer {
        const frameSize = header.frameWidth * header.frameHeight * 4;
        const pixelData = Buffer.alloc(frameSize);
        
        // ExampleJS algorithm: Fast processing without extensive bounds checking
        let pixelIndex = 0;
        for (let x = 0; x < header.frameHeight; x++) {
            for (let y = 0; y < header.frameWidth; y++) {
                const baseVal = 0x28 + x * 4 * header.width + y * 4 + frameIndex * header.frameWidth * 4;
                
                if (baseVal + 3 < spriteData.length) {
                    pixelData[pixelIndex++] = spriteData[baseVal + 0]; // R
                    pixelData[pixelIndex++] = spriteData[baseVal + 1]; // G
                    pixelData[pixelIndex++] = spriteData[baseVal + 2]; // B
                    pixelData[pixelIndex++] = spriteData[baseVal + 3]; // A
                } else {
                    pixelIndex += 4; // Skip invalid pixels
                }
            }
        }
        
        return pixelData;
    }

    test('Should handle large sprite files efficiently', function() {
        this.timeout(10000); // 10 second timeout for performance test
        
        const spriteFile = path.join(fixturesPath, '1171x1505_1_frame.sprite');
        if (!fs.existsSync(spriteFile)) {
            this.skip();
            return;
        }
        
        const spriteData = fs.readFileSync(spriteFile);
        const header = parseD2RSpriteHeader(spriteData);
        
        // Measure processing time
        const startTime = Date.now();
        const memBefore = measureMemoryUsage();
        
        const pixelData = processSpriteFast(spriteData, header, 0);
        
        const processingTime = Date.now() - startTime;
        const memAfter = measureMemoryUsage();
        
        // Performance assertions
        assert.ok(processingTime < 5000, `Processing should complete in under 5 seconds, took ${processingTime}ms`);
        
        // Verify output
        const expectedSize = header.frameWidth * header.frameHeight * 4;
        assert.strictEqual(pixelData.length, expectedSize, 'Output should have correct size');
        
        // Memory usage should be reasonable (less than 100MB increase)
        const memoryIncrease = memAfter.used - memBefore.used;
        assert.ok(memoryIncrease < 100 * 1024 * 1024, `Memory increase should be under 100MB, was ${Math.round(memoryIncrease / 1024 / 1024)}MB`);
        
        console.log(`Large sprite processing: ${processingTime}ms, ${Math.round(memoryIncrease / 1024)}KB memory`);
    });

    test('Should convert BGRA to RGBA efficiently', () => {
        const width = 512;
        const height = 512;
        const pixelCount = width * height;
        
        // Create test BGRA data
        const bgraData = Buffer.alloc(pixelCount * 4);
        for (let i = 0; i < pixelCount * 4; i += 4) {
            bgraData[i] = Math.floor(Math.random() * 256);     // B
            bgraData[i + 1] = Math.floor(Math.random() * 256); // G
            bgraData[i + 2] = Math.floor(Math.random() * 256); // R
            bgraData[i + 3] = 255; // A
        }
        
        const startTime = Date.now();
        
        // Convert BGRA to RGBA (though our implementation uses RGBA natively)
        const rgbaData = Buffer.alloc(pixelCount * 4);
        for (let i = 0; i < pixelCount * 4; i += 4) {
            rgbaData[i] = bgraData[i + 2];     // R = old B
            rgbaData[i + 1] = bgraData[i + 1]; // G = G  
            rgbaData[i + 2] = bgraData[i];     // B = old R
            rgbaData[i + 3] = bgraData[i + 3]; // A = A
        }
        
        const conversionTime = Date.now() - startTime;
        
        // Should convert 1MB of data quickly
        assert.ok(conversionTime < 200, `Conversion took ${conversionTime}ms, should be < 200ms`);
        assert.strictEqual(rgbaData.length, bgraData.length, 'Output should have same size as input');
    });

    test('Should validate memory usage for large files', () => {
        const initialMemory = process.memoryUsage().heapUsed;
        
        // Create large buffers to simulate sprite processing memory usage
        const largeBuffers = [];
        for (let i = 0; i < 8; i++) {
            // Each buffer represents a large sprite frame (1024x1024 RGBA)
            largeBuffers.push(Buffer.alloc(1024 * 1024 * 4));
        }
        
        const afterMemory = process.memoryUsage().heapUsed;
        const memoryIncrease = afterMemory - initialMemory;
        
        // Should allocate approximately 32MB (8 * 1024 * 1024 * 4 bytes)
        const expectedMemory = 8 * 1024 * 1024 * 4;
        assert.ok(memoryIncrease >= expectedMemory * 0.8, 'Should allocate at least 80% of expected memory');
        assert.ok(memoryIncrease < expectedMemory * 1.5, 'Should not exceed 150% of expected memory');
        
        console.log(`Memory usage test: allocated ${Math.round(memoryIncrease / 1024 / 1024)}MB`);
        
        // Cleanup
        largeBuffers.length = 0;
    });
});
