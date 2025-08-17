# Development Guide

## Project Structure

```
src/
├── extension.ts              # Extension entry point
├── sprite-editor-provider.ts # Custom editor implementation
└── test/                     # Test suite
    ├── suite/                # Test files
    ├── testUtils.ts          # Testing utilities
    └── README.md             # Testing documentation
```

## Development Setup

### Prerequisites
- Node.js 16+
- VS Code 1.48.0+
- TypeScript 4.9+

### Installation
```bash
git clone <repository>
cd vscode-sprite-editor-extension
npm install
```

### Build and Test
```bash
npm run compile     # Build TypeScript
npm run watch       # Watch mode for development
npm test           # Run test suite
npm run lint       # Code linting
```

## VS Code Development

### Running Extension
1. Open project in VS Code
2. Press `F5` or use "Run Extension" launch config
3. New VS Code window opens with extension loaded
4. Open any `.sprite` file to test

### Debugging
- Set breakpoints in TypeScript files
- Use "Extension Tests" launch config for test debugging
- Check Debug Console for logs

## Architecture

### Custom Editor Provider
The extension implements `vscode.CustomReadonlyEditorProvider`:
- **openCustomDocument**: Creates document instance
- **resolveCustomEditor**: Sets up webview with controls
- **Webview Communication**: Messages between webview and extension

### Sprite Processing
1. **File Reading**: Parse D2R sprite headers and pixel data using ExampleJS algorithm
2. **Conversion**: RGBA pixel format (no conversion needed for canvas)
3. **Rendering**: HTML5 canvas with pixelated styling
4. **Export/Import**: Bidirectional PNG conversion with pixel-perfect accuracy

### Paint.NET Integration
1. Export sprite as temporary PNG
2. Launch Paint.NET with file
3. Watch PNG for changes using `fs.watch`
4. Auto-convert PNG back to sprite on save

## Testing Strategy

### Test Categories
- **Unit Tests**: Core functionality and validation
- **Performance Tests**: Large file handling and memory usage
- **Integration Tests**: Complete workflows and external tools

### Test Utilities
```typescript
import { TestUtils } from './testUtils';

// Create mock sprite data
const spriteData = TestUtils.createMockSpriteFile(64, 64);

// Create test workspace
const workspace = TestUtils.createTestWorkspace('my-test');

// Cleanup after tests
TestUtils.cleanupTestWorkspace(workspace);
```

## Code Guidelines

### TypeScript Standards
- Strict type checking enabled
- Explicit return types for public methods
- Async/await for Promise handling
- Proper error handling with try/catch

### VS Code Integration
- Use VS Code API types (`vscode.*`)
- Handle disposal of resources
- Implement proper webview security
- Follow extension activation patterns

### Performance Considerations
- Lazy load large files
- Debounce file watching events
- Efficient buffer operations
- Memory cleanup after operations

## Building for Release

### Package Extension
```bash
npm run vscode:prepublish   # Pre-build checks
vsce package               # Create .vsix file
```

### Version Management
1. Update version in `package.json`
2. Update `CHANGELOG.md`
3. Tag release: `git tag v1.0.0`
4. Publish to marketplace

## Troubleshooting

### Common Issues
- **Canvas errors**: Ensure node-canvas is properly installed
- **Paint.NET not found**: Check file paths in Paint.NET integration
- **Large file performance**: Monitor memory usage in tests

### Debug Tips
- Enable TypeScript source maps for debugging
- Use VS Code output channels for logging
- Check webview developer tools for frontend issues

## Contributing

1. Fork repository
2. Create feature branch: `git checkout -b feature/new-feature`
3. Follow code guidelines and add tests
4. Submit pull request with clear description

## Resources

- [VS Code Extension API](https://code.visualstudio.com/api)
- [Custom Editor Guide](https://code.visualstudio.com/api/extension-guides/custom-editors)
- [Webview API](https://code.visualstudio.com/api/extension-guides/webview)
- [Testing Extensions](https://code.visualstudio.com/api/working-with-extensions/testing-extension)
