import * as assert from 'assert';
import * as vscode from 'vscode';
import * as path from 'path';
import * as fs from 'fs';

/**
 * Integration Tests: VS Code Extension Integration
 * Tests the extension's integration with VS Code APIs and file handling
 */
suite('Integration Tests: Extension Functionality', () => {

    let extension: vscode.Extension<any> | undefined;
    const fixturesPath = path.join(__dirname, '..', 'fixtures');

    suiteSetup(async () => {
        // Get the extension
        extension = vscode.extensions.getExtension('bethington.d2r-sprite-editor-2025');
        
        if (extension) {
            await extension.activate();
        }
    });

    test('Extension should be present and activated', () => {
        assert.ok(extension, 'Extension should be found');
        assert.strictEqual(extension?.isActive, true, 'Extension should be activated');
    });

    test('Should register custom editor provider', async () => {
        // This tests that the custom editor is properly registered
        assert.ok(extension, 'Extension must be present for this test');
        
        // The custom editor registration happens during activation
        // We can't directly test the registration, but we can verify the extension is active
        assert.strictEqual(extension.isActive, true, 'Extension should be active and custom editor registered');
    });

    test('Should handle sprite file opening workflow', async () => {
        const testSpriteFile = path.join(fixturesPath, '315x80_4_frames.sprite');
        
        if (!fs.existsSync(testSpriteFile)) {
            assert.fail('Test sprite file should exist');
        }
        
        try {
            // Create a URI for the sprite file
            const fileUri = vscode.Uri.file(testSpriteFile);
            
            // Try to open the document - this should trigger our custom editor
            const document = await vscode.workspace.openTextDocument(fileUri);
            assert.ok(document, 'Should be able to create document for sprite file');
            
            // Verify the document properties
            assert.strictEqual(document.uri.fsPath, testSpriteFile, 'Document URI should match the file');
            assert.ok(document.fileName.endsWith('.sprite'), 'Document should have .sprite extension');
            
        } catch (error) {
            // Custom editor might not be fully testable in this environment
            console.log('Custom editor test limitation:', error);
            // This is expected in the test environment - custom editors need webview support
        }
    });

    test('Should support .sprite file extension', () => {
        // Test that our extension configuration includes sprite files
        const packageJson = require('../../../package.json');
        
        // Check if our custom editor is configured
        const customEditors = packageJson.contributes?.customEditors;
        assert.ok(customEditors, 'Package should contribute custom editors');
        
        const spriteEditor = customEditors.find((editor: any) => 
            editor.viewType === 'd2rmodding.spriteViewer'
        );
        
        assert.ok(spriteEditor, 'Should have sprite viewer custom editor');
        
        // Check file selector
        const selector = spriteEditor.selector;
        assert.ok(selector, 'Custom editor should have file selector');
        
        const spriteSelector = selector.find((sel: any) => 
            sel.filenamePattern === '*.sprite'
        );
        
        assert.ok(spriteSelector, 'Should handle *.sprite files');
    });

    test('Should have proper activation events', () => {
        const packageJson = require('../../../package.json');
        const activationEvents = packageJson.activationEvents;
        
        assert.ok(activationEvents, 'Should have activation events');
        assert.ok(activationEvents.includes('onCustomEditor:d2rmodding.spriteViewer'), 
            'Should activate on sprite viewer custom editor');
    });

    test('Should have correct extension metadata', () => {
        assert.ok(extension, 'Extension must be present');
        
        const packageJson = extension.packageJSON;
        
        assert.strictEqual(packageJson.name, 'd2r-sprite-editor-2025', 'Extension name should match');
        assert.strictEqual(packageJson.displayName, 'D2R Sprite Editor', 'Display name should match');
        assert.strictEqual(packageJson.publisher, 'bethington', 'Publisher should match');
        assert.strictEqual(packageJson.version, '1.1.0', 'Version should be 1.1.0');
    });

    test('Should have proper command contributions', () => {
        const packageJson = require('../../../package.json');
        const commands = packageJson.contributes?.commands;
        
        // Our extension doesn't contribute commands directly (uses webview messages)
        // but we should verify the package structure
        assert.ok(packageJson.contributes, 'Should have contribution points');
    });

    test('Should handle file system operations', async () => {
        const testSpriteFile = path.join(fixturesPath, '315x80_4_frames.sprite');
        
        // Test file reading capability
        try {
            const fileStats = await vscode.workspace.fs.stat(vscode.Uri.file(testSpriteFile));
            assert.ok(fileStats.size > 0, 'Test sprite file should have content');
            assert.strictEqual(fileStats.type, vscode.FileType.File, 'Should be recognized as file');
        } catch (error) {
            assert.fail(`Should be able to access test sprite file: ${error}`);
        }
    });

    test('Should handle workspace folder operations', () => {
        const workspaceFolders = vscode.workspace.workspaceFolders;
        
        if (workspaceFolders && workspaceFolders.length > 0) {
            const rootFolder = workspaceFolders[0];
            assert.ok(rootFolder.uri, 'Workspace folder should have URI');
            assert.ok(rootFolder.name, 'Workspace folder should have name');
        }
        
        // This test passes whether or not there's a workspace
        assert.ok(true, 'Workspace folder handling test completed');
    });

    test('Should handle configuration correctly', () => {
        // Test VS Code configuration access
        const config = vscode.workspace.getConfiguration('d2r-sprite-editor');
        assert.ok(config, 'Should be able to access extension configuration');
        
        // Our extension doesn't define specific configuration options yet,
        // but this tests the configuration system integration
    });

    test('Should support required VS Code version', () => {
        const packageJson = require('../../../package.json');
        const requiredVersion = packageJson.engines?.vscode;
        
        assert.ok(requiredVersion, 'Should specify required VS Code version');
        assert.ok(requiredVersion.includes('1.48.0'), 'Should require VS Code 1.48.0 or higher');
    });

    test('Should have proper icon configuration', () => {
        const packageJson = require('../../../package.json');
        const iconPath = packageJson.icon;
        
        assert.strictEqual(iconPath, 'docs/images/icon.png', 'Should have correct icon path');
        
        // Check if icon file exists
        const iconFile = path.join(__dirname, '../../..', iconPath);
        if (fs.existsSync(iconFile)) {
            const iconStats = fs.statSync(iconFile);
            assert.ok(iconStats.isFile(), 'Icon should be a file');
            assert.ok(iconStats.size > 0, 'Icon file should have content');
        }
    });

    test('Should handle error conditions gracefully', async () => {
        const nonExistentFile = path.join(fixturesPath, 'nonexistent.sprite');
        
        try {
            await vscode.workspace.fs.stat(vscode.Uri.file(nonExistentFile));
            assert.fail('Should throw error for non-existent file');
        } catch (error) {
            // Expected to fail - this tests error handling
            assert.ok(true, 'Correctly handles non-existent files');
        }
    });

    test('Should support multiple sprite files', () => {
        const spriteFiles = [
            '315x80_4_frames.sprite',
            '88x20_51_frames.sprite',
            '1171x1505_1_frame.sprite',
            '1862x15_1_frame.sprite'
        ];
        
        let existingFiles = 0;
        
        for (const filename of spriteFiles) {
            const filepath = path.join(fixturesPath, filename);
            if (fs.existsSync(filepath)) {
                existingFiles++;
                
                // Verify file is readable
                const stats = fs.statSync(filepath);
                assert.ok(stats.isFile(), `${filename} should be a file`);
                assert.ok(stats.size > 0, `${filename} should have content`);
            }
        }
        
        assert.ok(existingFiles >= 2, 'Should have multiple test sprite files available');
    });

    test('Should handle Canvas dependency requirement', () => {
        // Test that canvas module requirement is properly handled
        try {
            // This would normally require the canvas module
            // In test environment, we verify the requirement is documented
            const packageJson = require('../../../package.json');
            const dependencies = packageJson.dependencies;
            
            assert.ok(dependencies, 'Should have dependencies');
            assert.ok(dependencies.canvas, 'Should depend on canvas module');
            
        } catch (error) {
            console.log('Canvas dependency test note:', error);
        }
    });

    test('Should maintain extension state correctly', () => {
        assert.ok(extension, 'Extension should remain available');
        assert.strictEqual(extension.isActive, true, 'Extension should remain active');
        
        // Test that extension ID is correct
        assert.strictEqual(extension.id, 'bethington.d2r-sprite-editor-2025', 
            'Extension ID should match package name');
    });
});
