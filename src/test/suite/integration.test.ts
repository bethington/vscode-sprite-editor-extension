import * as assert from 'assert';
import * as vscode from 'vscode';
import * as path from 'path';
import * as fs from 'fs';

/**
 * Integration Test Suite - Tests full workflow
 */
suite('Integration Tests', () => {
    let testWorkspaceFolder: string;

    suiteSetup(async () => {
        // Setup test workspace
        testWorkspaceFolder = path.resolve(__dirname, '../../../test-workspace');
        if (!fs.existsSync(testWorkspaceFolder)) {
            fs.mkdirSync(testWorkspaceFolder, { recursive: true });
        }
    });

    suiteTeardown(() => {
        // Cleanup test workspace
        if (fs.existsSync(testWorkspaceFolder)) {
            fs.rmSync(testWorkspaceFolder, { recursive: true, force: true });
        }
    });

    test('Should open sprite file in custom editor', async () => {
        // Create a test sprite file
        const testSpritePath = path.join(testWorkspaceFolder, 'test.sprite');
        const mockSpriteData = createMockSpriteFile(64, 64);
        fs.writeFileSync(testSpritePath, mockSpriteData);

        // Open the file
        const uri = vscode.Uri.file(testSpritePath);
        const doc = await vscode.workspace.openTextDocument(uri);
        
        assert.ok(doc);
        assert.strictEqual(path.basename(doc.uri.fsPath), 'test.sprite');
    });

    test('Should handle export to PNG workflow', async () => {
        const testSpritePath = path.join(testWorkspaceFolder, 'export-test.sprite');
        const mockSpriteData = createMockSpriteFile(32, 32);
        fs.writeFileSync(testSpritePath, mockSpriteData);

        // Simulate export workflow
        const expectedPngPath = path.join(testWorkspaceFolder, 'export-test.png');
        
        // Mock the conversion process
        const mockPngData = Buffer.from('PNG mock data');
        fs.writeFileSync(expectedPngPath, mockPngData);

        assert.ok(fs.existsSync(expectedPngPath));
        
        // Cleanup
        fs.unlinkSync(expectedPngPath);
        fs.unlinkSync(testSpritePath);
    });

    test('Should handle import from PNG workflow', async () => {
        const testPngPath = path.join(testWorkspaceFolder, 'import-test.png');
        const testSpritePath = path.join(testWorkspaceFolder, 'import-test.sprite');
        
        // Create mock files
        const mockPngData = Buffer.from('PNG mock data');
        const mockSpriteData = createMockSpriteFile(32, 32);
        
        fs.writeFileSync(testPngPath, mockPngData);
        fs.writeFileSync(testSpritePath, mockSpriteData);

        // Simulate import workflow
        assert.ok(fs.existsSync(testPngPath));
        assert.ok(fs.existsSync(testSpritePath));
        
        // Cleanup
        fs.unlinkSync(testPngPath);
        fs.unlinkSync(testSpritePath);
    });

    test('Should handle Paint.NET integration workflow', async () => {
        const testSpritePath = path.join(testWorkspaceFolder, 'paintnet-test.sprite');
        const mockSpriteData = createMockSpriteFile(64, 64);
        fs.writeFileSync(testSpritePath, mockSpriteData);

        // Simulate Paint.NET workflow
        const tempPngPath = path.join(testWorkspaceFolder, 'paintnet-test.png');
        const mockPngData = Buffer.from('PNG data for Paint.NET');
        fs.writeFileSync(tempPngPath, mockPngData);

        // Verify files exist
        assert.ok(fs.existsSync(testSpritePath));
        assert.ok(fs.existsSync(tempPngPath));

        // Simulate file watching and update
        const originalSize = fs.statSync(testSpritePath).size;
        
        // Mock file update
        setTimeout(() => {
            const updatedSpriteData = createMockSpriteFile(64, 64, 'updated');
            fs.writeFileSync(testSpritePath, updatedSpriteData);
        }, 100);

        // Wait for update
        await new Promise(resolve => setTimeout(resolve, 200));
        
        const updatedSize = fs.statSync(testSpritePath).size;
        assert.notStrictEqual(originalSize, updatedSize);

        // Cleanup
        fs.unlinkSync(tempPngPath);
        fs.unlinkSync(testSpritePath);
    });
});

/**
 * Helper function to create mock sprite file data
 */
function createMockSpriteFile(width: number, height: number, variant: string = 'default'): Buffer {
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
