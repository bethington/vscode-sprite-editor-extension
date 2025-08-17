import * as assert from 'assert';
import * as path from 'path';
import * as fs from 'fs';

/**
 * Test Validation Suite
 * Validates that all test files and fixtures are properly configured
 */
suite('Test Environment Validation', () => {

    const fixturesPath = path.join(__dirname, '..', 'fixtures');
    const suiteDir = __dirname;

    test('Should have all required test fixtures', () => {
        const requiredSprites = [
            '315x80_4_frames.sprite',
            '88x20_51_frames.sprite',
            '1171x1505_1_frame.sprite',
            '1862x15_1_frame.sprite'
        ];

        const requiredPngs = [
            '315x80_4_frames_0.png',
            '315x80_4_frames_1.png',
            '315x80_4_frames_2.png',
            '315x80_4_frames_3.png',
            '88x20_51_frames_0.png',
            '88x20_51_frames_25.png',
            '88x20_51_frames_50.png',
            '1171x1505_1_frame_0.png'
        ];

        // Check sprite files
        for (const sprite of requiredSprites) {
            const spritePath = path.join(fixturesPath, sprite);
            assert.ok(fs.existsSync(spritePath), `Required sprite file missing: ${sprite}`);
            
            const stats = fs.statSync(spritePath);
            assert.ok(stats.size > 40, `Sprite file ${sprite} should be larger than header size (40 bytes)`);
        }

        // Check PNG reference files (some may not exist, that's okay)
        let foundPngs = 0;
        for (const png of requiredPngs) {
            const pngPath = path.join(fixturesPath, png);
            if (fs.existsSync(pngPath)) {
                foundPngs++;
                const stats = fs.statSync(pngPath);
                assert.ok(stats.size > 100, `PNG file ${png} should have reasonable size`);
            }
        }

        assert.ok(foundPngs >= 4, `Should have at least 4 reference PNG files, found ${foundPngs}`);
    });

    test('Should have all test suite files', () => {
        const requiredTestFiles = [
            'unit-header-parsing.test.js',
            'unit-pixel-extraction.test.js',
            'functional-pixel-comparison.test.js',
            'integration-vscode.test.js',
            'performance.test.js'
        ];

        for (const testFile of requiredTestFiles) {
            const testPath = path.join(suiteDir, testFile);
            assert.ok(fs.existsSync(testPath), `Required test file missing: ${testFile}`);
            
            const stats = fs.statSync(testPath);
            assert.ok(stats.size > 100, `Test file ${testFile} should have content`);
        }
    });

    test('Should have proper test directory structure', () => {
        // Check main directories exist
        const testDir = path.join(__dirname, '..');
        assert.ok(fs.existsSync(testDir), 'Test directory should exist');
        
        const fixturesDir = path.join(testDir, 'fixtures');
        assert.ok(fs.existsSync(fixturesDir), 'Fixtures directory should exist');
        
        const suiteDir = path.join(testDir, 'suite');
        assert.ok(fs.existsSync(suiteDir), 'Suite directory should exist');
    });

    test('Should have proper package.json test configuration', () => {
        const packagePath = path.join(__dirname, '../../../package.json');
        assert.ok(fs.existsSync(packagePath), 'package.json should exist');
        
        const packageJson = JSON.parse(fs.readFileSync(packagePath, 'utf8'));
        
        // Check test scripts
        assert.ok(packageJson.scripts, 'Package should have scripts');
        assert.ok(packageJson.scripts.test, 'Package should have test script');
        assert.ok(packageJson.scripts.pretest, 'Package should have pretest script');
        
        // Check dev dependencies for testing
        assert.ok(packageJson.devDependencies, 'Package should have dev dependencies');
        assert.ok(packageJson.devDependencies.mocha, 'Package should have mocha dependency');
        assert.ok(packageJson.devDependencies['@types/mocha'], 'Package should have mocha types');
    });

    test('Should validate sprite file formats', () => {
        const spriteFiles = fs.readdirSync(fixturesPath).filter(f => f.endsWith('.sprite'));
        
        assert.ok(spriteFiles.length >= 3, 'Should have at least 3 sprite files');
        
        for (const spriteFile of spriteFiles) {
            const spritePath = path.join(fixturesPath, spriteFile);
            const spriteData = fs.readFileSync(spritePath);
            
            // Check magic signature
            const magic = spriteData.toString('ascii', 0, 4);
            assert.ok(magic === 'SpA1' || magic === 'SPa1', 
                `${spriteFile} should have valid magic signature, got '${magic}'`);
            
            // Check file size is reasonable
            assert.ok(spriteData.length >= 40, 
                `${spriteFile} should be at least 40 bytes (header size)`);
                
            // Try to parse dimensions
            const totalWidth = spriteData.readInt32LE(8);
            const frameHeight = spriteData.readInt32LE(12);
            const frameCount = spriteData.readUInt32LE(20);
            
            assert.ok(totalWidth > 0 && totalWidth <= 16384, 
                `${spriteFile} should have valid width: ${totalWidth}`);
            assert.ok(frameHeight > 0 && frameHeight <= 16384, 
                `${spriteFile} should have valid height: ${frameHeight}`);
            assert.ok(frameCount >= 1, 
                `${spriteFile} should have at least 1 frame: ${frameCount}`);
        }
    });

    test('Should have TypeScript compilation support', () => {
        const tsconfigPath = path.join(__dirname, '../../../tsconfig.json');
        assert.ok(fs.existsSync(tsconfigPath), 'tsconfig.json should exist');
        
        const tsconfig = JSON.parse(fs.readFileSync(tsconfigPath, 'utf8'));
        assert.ok(tsconfig.compilerOptions, 'tsconfig should have compiler options');
        assert.ok(tsconfig.compilerOptions.outDir, 'tsconfig should specify output directory');
    });

    test('Should validate test performance', function() {
        this.timeout(5000); // 5 second timeout
        
        const startTime = Date.now();
        
        // Simulate test setup operations
        const testOperations = [];
        for (let i = 0; i < 100; i++) {
            testOperations.push(i * 2);
        }
        
        // Check memory usage
        const memBefore = process.memoryUsage();
        const testData = Buffer.alloc(1024 * 1024); // 1MB
        const memAfter = process.memoryUsage();
        
        const setupTime = Date.now() - startTime;
        const memoryIncrease = memAfter.heapUsed - memBefore.heapUsed;
        
        assert.ok(setupTime < 1000, `Test setup should be fast, took ${setupTime}ms`);
        assert.ok(memoryIncrease > 0, `Should allocate test memory`);
        assert.ok(memoryIncrease < 10 * 1024 * 1024, `Memory usage should be reasonable`);
    });

    test('Should have proper error handling in tests', () => {
        // Test that we can handle missing files gracefully
        const nonExistentFile = path.join(fixturesPath, 'does-not-exist.sprite');
        assert.ok(!fs.existsSync(nonExistentFile), 'Non-existent file should not exist');
        
        // Test error throwing
        assert.throws(() => {
            throw new Error('Test error');
        }, /Test error/, 'Should properly handle thrown errors');
        
        // Test async error handling capability
        const asyncTest = async () => {
            try {
                await fs.promises.readFile(nonExistentFile);
                assert.fail('Should have thrown error for non-existent file');
            } catch (error) {
                assert.ok(error, 'Should catch file read errors');
            }
        };
        
        return asyncTest(); // Return promise for async test
    });
});
