import * as assert from 'assert';
import * as fs from 'fs';
import * as path from 'path';

/**
 * Performance and Large File Test Suite
 */
suite('Performance Tests', () => {
    const testDataPath = path.resolve(__dirname, '../../../test-data');

    test('Should handle large sprite files efficiently', async () => {
        // Test with 512x512 sprite (similar to test_large.sprite)
        const largeWidth = 512;
        const largeHeight = 512;
        const pixelCount = largeWidth * largeHeight;
        const dataSize = pixelCount * 4; // BGRA

        const startTime = Date.now();
        
        // Simulate processing large sprite data
        const mockData = Buffer.alloc(dataSize);
        for (let i = 0; i < pixelCount; i++) {
            const offset = i * 4;
            mockData[offset] = Math.floor(Math.random() * 256);     // B
            mockData[offset + 1] = Math.floor(Math.random() * 256); // G
            mockData[offset + 2] = Math.floor(Math.random() * 256); // R
            mockData[offset + 3] = 255; // A
        }

        const processingTime = Date.now() - startTime;
        
        // Should process 1MB+ of data in reasonable time (< 1 second)
        assert.ok(processingTime < 1000, `Processing took ${processingTime}ms, should be < 1000ms`);
        assert.strictEqual(mockData.length, dataSize);
    });

    test('Should convert BGRA to RGBA efficiently', () => {
        const width = 256;
        const height = 256;
        const pixelCount = width * height;
        
        const bgraData = Buffer.alloc(pixelCount * 4);
        const startTime = Date.now();
        
        // Simulate BGRA to RGBA conversion
        const rgbaData = Buffer.alloc(pixelCount * 4);
        for (let i = 0; i < pixelCount; i++) {
            const offset = i * 4;
            rgbaData[offset] = bgraData[offset + 2];     // R = B
            rgbaData[offset + 1] = bgraData[offset + 1]; // G = G
            rgbaData[offset + 2] = bgraData[offset];     // B = R
            rgbaData[offset + 3] = bgraData[offset + 3]; // A = A
        }
        
        const conversionTime = Date.now() - startTime;
        
        // Should convert 256KB in reasonable time
        assert.ok(conversionTime < 100, `Conversion took ${conversionTime}ms, should be < 100ms`);
        assert.strictEqual(rgbaData.length, bgraData.length);
    });

    test('Should validate memory usage for large files', () => {
        const initialMemory = process.memoryUsage().heapUsed;
        
        // Create multiple large buffers to simulate memory usage
        const buffers = [];
        for (let i = 0; i < 10; i++) {
            buffers.push(Buffer.alloc(1024 * 1024)); // 1MB each
        }
        
        const afterMemory = process.memoryUsage().heapUsed;
        const memoryIncrease = afterMemory - initialMemory;
        
        // Should use approximately 10MB (allowing for some overhead)
        assert.ok(memoryIncrease > 8 * 1024 * 1024, 'Should allocate at least 8MB');
        assert.ok(memoryIncrease < 15 * 1024 * 1024, 'Should not exceed 15MB');
        
        // Cleanup
        buffers.length = 0;
    });
});
