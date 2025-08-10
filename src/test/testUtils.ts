import * as fs from 'fs';
import * as path from 'path';

/**
 * Test utilities for D2R Sprite Editor tests
 */
export class TestUtils {
    /**
     * Create a mock D2R sprite file for testing
     */
    static createMockSpriteFile(width: number, height: number, variant: string = 'default'): Buffer {
        const headerSize = 0x28; // 40 bytes
        const pixelDataSize = width * height * 4; // BGRA
        const totalSize = headerSize + pixelDataSize;
        
        const buffer = Buffer.alloc(totalSize);
        
        // Write header
        buffer.write('SpA1', 0, 4, 'ascii');           // Magic
        buffer.writeUInt16LE(1, 4);                     // Version
        buffer.writeUInt16LE(width, 6);                 // Width
        buffer.writeUInt16LE(height, 8);                // Height
        
        // Fill remaining header with zeros
        for (let i = 10; i < headerSize; i++) {
            buffer[i] = 0;
        }
        
        // Fill pixel data with test pattern
        for (let i = 0; i < width * height; i++) {
            const offset = headerSize + i * 4;
            const pattern = variant === 'updated' ? 128 : 64;
            buffer[offset] = pattern;       // B
            buffer[offset + 1] = pattern;   // G
            buffer[offset + 2] = pattern;   // R
            buffer[offset + 3] = 255;       // A
        }
        
        return buffer;
    }

    /**
     * Create a test workspace directory
     */
    static createTestWorkspace(workspaceName: string): string {
        const testDir = path.resolve(__dirname, '../../test-workspace', workspaceName);
        if (!fs.existsSync(testDir)) {
            fs.mkdirSync(testDir, { recursive: true });
        }
        return testDir;
    }

    /**
     * Clean up test workspace
     */
    static cleanupTestWorkspace(workspacePath: string): void {
        if (fs.existsSync(workspacePath)) {
            fs.rmSync(workspacePath, { recursive: true, force: true });
        }
    }

    /**
     * Create a test sprite file and return its path
     */
    static createTestSpriteFile(directory: string, filename: string, width: number = 64, height: number = 64): string {
        const spritePath = path.join(directory, filename);
        const spriteData = this.createMockSpriteFile(width, height);
        fs.writeFileSync(spritePath, spriteData);
        return spritePath;
    }

    /**
     * Assert that a buffer contains valid D2R sprite header
     */
    static validateSpriteHeader(buffer: Buffer): { magic: string; width: number; height: number; version: number } {
        if (buffer.length < 16) {
            throw new Error('Buffer too small for sprite header');
        }

        const magic = buffer.toString('ascii', 0, 4);
        const version = buffer.readUInt16LE(4);
        const width = buffer.readUInt16LE(6);
        const height = buffer.readUInt16LE(8);

        if (magic !== 'SpA1' && magic !== 'SPa1') {
            throw new Error(`Invalid sprite magic: ${magic}`);
        }

        if (width <= 0 || height <= 0 || width > 4096 || height > 4096) {
            throw new Error(`Invalid dimensions: ${width}x${height}`);
        }

        return { magic, version, width, height };
    }

    /**
     * Measure execution time of a function
     */
    static async measureExecutionTime<T>(fn: () => Promise<T> | T): Promise<{ result: T; timeMs: number }> {
        const startTime = Date.now();
        const result = await fn();
        const timeMs = Date.now() - startTime;
        return { result, timeMs };
    }

    /**
     * Create large test sprite for performance testing
     */
    static createLargeTestSprite(width: number = 512, height: number = 512): Buffer {
        return this.createMockSpriteFile(width, height, 'large');
    }

    /**
     * Validate memory usage is within expected bounds
     */
    static validateMemoryUsage(maxMemoryMB: number): void {
        const memoryUsage = process.memoryUsage();
        const heapUsedMB = memoryUsage.heapUsed / (1024 * 1024);
        
        if (heapUsedMB > maxMemoryMB) {
            throw new Error(`Memory usage ${heapUsedMB.toFixed(2)}MB exceeds limit ${maxMemoryMB}MB`);
        }
    }
}
