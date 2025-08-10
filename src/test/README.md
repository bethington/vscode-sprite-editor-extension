# Testing Documentation

## Overview

This directory contains the test suite for the D2R Sprite Editor extension, organized using VS Code extension testing best practices.

## Structure

```
src/test/
├── runTest.ts              # VS Code test runner
├── testUtils.ts            # Shared testing utilities
├── fixtures/               # Test data files
└── suite/                  # Test suites
    ├── index.ts            # Test suite runner
    ├── extension.test.ts   # Unit tests
    ├── performance.test.ts # Performance tests
    └── integration.test.ts # Integration tests
```

## Running Tests

### Command Line
```bash
npm test                    # Run all tests
npm run pretest             # Compile and lint only
```

### VS Code
- Use "Extension Tests" debug configuration
- Set breakpoints in test files for debugging

## Test Categories

### Unit Tests (`extension.test.ts`)
- Extension registration and activation
- Sprite header parsing and validation
- Error handling for invalid files

### Performance Tests (`performance.test.ts`) 
- Large file handling (512x512+ sprites)
- Memory usage validation
- Processing time benchmarks

### Integration Tests (`integration.test.ts`)
- Complete file workflows
- PNG export/import functionality
- Paint.NET integration simulation

## Test Utilities

The `TestUtils` class provides:
- Mock sprite file generation
- Test workspace management
- Performance measurement helpers
- Memory validation utilities

## Adding Tests

1. Choose appropriate test suite (unit/performance/integration)
2. Use `TestUtils` for common operations
3. Include proper setup/teardown
4. Follow async/await patterns

Example:
```typescript
import { TestUtils } from '../testUtils';

test('Should handle sprite conversion', async () => {
    const workspace = TestUtils.createTestWorkspace('test');
    const spriteData = TestUtils.createMockSpriteFile(64, 64);
    // ... test logic
    TestUtils.cleanupTestWorkspace(workspace);
});
```
