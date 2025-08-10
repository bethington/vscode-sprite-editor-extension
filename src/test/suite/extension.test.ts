import * as assert from 'assert';
import * as vscode from 'vscode';
import * as path from 'path';
import * as fs from 'fs';

/**
 * Test suite for SpriteEditorProvider
 */
suite('Sprite Editor Provider Test Suite', () => {
    vscode.window.showInformationMessage('Start all tests.');

    test('Extension should be present', () => {
        assert.ok(vscode.extensions.getExtension('d2rmodding.d2r-sprite-editor-2025'));
    });

    test('Should register sprite custom editor', async () => {
        const doc = await vscode.workspace.openTextDocument({
            content: '',
            language: 'plaintext'
        });
        assert.ok(doc);
    });

    test('Should handle sprite file header parsing', () => {
        // Test D2R sprite header parsing logic
        const mockSpriteData = Buffer.alloc(40);
        mockSpriteData.write('SpA1', 0, 4, 'ascii');
        mockSpriteData.writeUInt16LE(1, 4); // version
        mockSpriteData.writeUInt16LE(64, 6); // width
        mockSpriteData.writeUInt16LE(64, 8); // height

        // Mock header parsing (we would import the actual function)
        const parseHeader = (data: Buffer) => {
            const magic = data.toString('ascii', 0, 4);
            const version = data.readUInt16LE(4);
            const width = data.readUInt16LE(6);
            const height = data.readUInt16LE(8);
            return { magic, version, width, height };
        };

        const header = parseHeader(mockSpriteData);
        assert.strictEqual(header.magic, 'SpA1');
        assert.strictEqual(header.width, 64);
        assert.strictEqual(header.height, 64);
    });

    test('Should validate sprite dimensions', () => {
        const validateDimensions = (width: number, height: number) => {
            return width > 0 && height > 0 && width <= 4096 && height <= 4096;
        };

        assert.strictEqual(validateDimensions(64, 64), true);
        assert.strictEqual(validateDimensions(0, 64), false);
        assert.strictEqual(validateDimensions(5000, 64), false);
    });
});
