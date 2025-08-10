import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';
import { exec, spawn } from 'child_process';
import { promisify } from 'util';

/**
 * Custom Editor Provider for D2R Sprite files
 * Automatically opens sprite files when selected/clicked
 */
export class SpriteEditorProvider implements vscode.CustomReadonlyEditorProvider {
    
    public static register(context: vscode.ExtensionContext): vscode.Disposable {
        const provider = new SpriteEditorProvider(context);
        const providerRegistration = vscode.window.registerCustomEditorProvider('d2rmodding.spriteViewer', provider);
        return providerRegistration;
    }

    constructor(private readonly context: vscode.ExtensionContext) { }

    /**
     * Called when VS Code needs to open a .sprite file
     */
    public async openCustomDocument(
        uri: vscode.Uri,
        openContext: { backupId?: string },
        _token: vscode.CancellationToken
    ): Promise<vscode.CustomDocument> {
        return {
            uri,
            dispose: () => { }
        };
    }

    /**
     * Called when VS Code needs to resolve the webview editor for a .sprite file
     */
    public async resolveCustomEditor(
        document: vscode.CustomDocument,
        webviewPanel: vscode.WebviewPanel,
        _token: vscode.CancellationToken
    ): Promise<void> {
        // Configure webview
        webviewPanel.webview.options = {
            enableScripts: true,
        };

        // Handle messages from webview
        webviewPanel.webview.onDidReceiveMessage(
            async (message) => {
                switch (message.command) {
                    case 'openExternalEditor':
                        await this.handleExternalEdit(document, message.imageData);
                        break;
                    case 'exportToPng':
                        await this.handleExportToPng(document, message.imageData);
                        break;
                    case 'importFromPng':
                        await this.handleImportFromPng(document);
                        break;
                }
            }
        );

        try {
            // Read and convert sprite file
            const spriteData = fs.readFileSync(document.uri.fsPath);
            const pngBuffer = await this.convertSpriteToPng(spriteData);
            const base64Png = pngBuffer.toString('base64');
            
            // Set webview content
            webviewPanel.webview.html = this.getWebviewContent(
                base64Png, 
                path.basename(document.uri.fsPath)
            );

            // Update title
            webviewPanel.title = `🖼️ ${path.basename(document.uri.fsPath)}`;

        } catch (error) {
            // Show error in webview
            webviewPanel.webview.html = this.getErrorWebviewContent(
                `Failed to load sprite: ${error}`,
                path.basename(document.uri.fsPath)
            );
            console.error('Sprite loading error:', error);
        }
    }

    /**
     * Generate the webview HTML content for displaying the sprite
     */
    private getWebviewContent(base64Png: string, fileName: string): string {
        return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>D2R Sprite Viewer</title>
    <script>
        // Acquire VS Code API
        const vscode = acquireVsCodeApi();
    </script>
    <style>
        body {
            margin: 0;
            padding: 10px;
            font-family: var(--vscode-font-family);
            background-color: var(--vscode-editor-background);
            color: var(--vscode-editor-foreground);
            overflow-x: hidden;
            overflow-y: auto;
            display: flex;
            flex-direction: column;
            min-height: 100vh;
            max-width: 100vw;
            box-sizing: border-box;
        }
        .viewer-container {
            flex: 1;
            display: flex;
            flex-direction: column;
            align-items: center;
            gap: 10px;
            min-height: 0;
        }
        .image-container {
            border: 1px solid var(--vscode-panel-border);
            border-radius: 4px;
            padding: 5px;
            background: var(--vscode-editor-background);
            box-shadow: 0 1px 4px rgba(0,0,0,0.1);
            position: relative;
            display: flex;
            justify-content: center;
            align-items: center;
            width: 100%;
            max-height: calc(100vh - 80px);
            overflow: hidden;
            flex-shrink: 1;
            box-sizing: border-box;
        }
        .sprite-image {
            display: block;
            max-width: calc(100vw - 10px);
            max-height: calc(100vh - 10px);
            width: auto;
            height: auto;
            object-fit: contain;
            image-rendering: pixelated;
            image-rendering: -moz-crisp-edges;
            image-rendering: crisp-edges;
            background: 
                linear-gradient(45deg, #ccc 25%, transparent 25%), 
                linear-gradient(-45deg, #ccc 25%, transparent 25%), 
                linear-gradient(45deg, transparent 75%, #ccc 75%), 
                linear-gradient(-45deg, transparent 75%, #ccc 75%);
            background-size: 20px 20px;
            background-position: 0 0, 0 10px, 10px -10px, -10px 0px;
            transition: transform 0.1s ease;
            transform-origin: center center;
        }
        .controls {
            display: flex;
            gap: 8px;
            flex-wrap: wrap;
            justify-content: center;
            flex-shrink: 0;
            margin: 5px 0;
        }
        .control-button {
            background: var(--vscode-button-background);
            color: var(--vscode-button-foreground);
            border: none;
            padding: 8px 16px;
            border-radius: 4px;
            cursor: pointer;
            font-size: 14px;
            transition: background-color 0.2s;
        }
        .control-button:hover {
            background: var(--vscode-button-hoverBackground);
        }
        .control-button.active {
            background: var(--vscode-button-foreground);
            color: var(--vscode-button-background);
        }
        .info-panel {
            background: var(--vscode-input-background);
            border: 1px solid var(--vscode-input-border);
            border-radius: 4px;
            padding: 10px;
            margin-top: 5px;
            font-family: var(--vscode-editor-font-family);
            font-size: 13px;
            max-width: 600px;
            flex-shrink: 0;
        }
        .info-row {
            display: flex;
            justify-content: space-between;
            margin-bottom: 5px;
        }
        .info-label {
            color: var(--vscode-descriptionForeground);
            font-weight: 500;
        }
        .zoom-info {
            position: absolute;
            top: 10px;
            right: 10px;
            background: rgba(0,0,0,0.7);
            color: white;
            padding: 4px 8px;
            border-radius: 4px;
            font-size: 12px;
            pointer-events: none;
            opacity: 0;
            transition: opacity 0.2s;
        }
        .image-container:hover .zoom-info {
            opacity: 1;
        }
    </style>
</head>
<body>
    <div class="viewer-container">
        <div class="image-container">
            <div class="zoom-info" id="zoomInfo">100%</div>
            <img id="spriteImage" class="sprite-image" src="data:image/png;base64,${base64Png}" alt="D2R Sprite" />
        </div>
        
        <div class="controls">
            <button class="control-button active" id="backgroundBtn" onclick="toggleBackground()">
                🏁 Transparency Grid
            </button>
            <button class="control-button" onclick="resetZoom()">
                🔍 Reset Zoom
            </button>
            <button class="control-button" onclick="openExternalEditor()">
                🎨 Edit in Paint.NET
            </button>
            <button class="control-button" onclick="exportToPng()">
                📤 Export to PNG
            </button>
            <button class="control-button" onclick="importFromPng()">
                📥 Import from PNG
            </button>
        </div>
        
        <div class="info-panel">
            <div class="info-row">
                <span class="info-label">File:</span>
                <span>${fileName}</span>
            </div>
            <div class="info-row">
                <span class="info-label">Dimensions:</span>
                <span id="dimensions">Loading...</span>
            </div>
            <div class="info-row">
                <span class="info-label">Format:</span>
                <span>D2R Sprite (SpA1/SPa1)</span>
            </div>
            <div class="info-row">
                <span class="info-label">Controls:</span>
                <span>Mouse wheel to zoom, drag to pan</span>
            </div>
        </div>
    </div>

    <script>
        const img = document.getElementById('spriteImage');
        const zoomInfo = document.getElementById('zoomInfo');
        const dimensions = document.getElementById('dimensions');
        const backgroundBtn = document.getElementById('backgroundBtn');
        
        let scale = 1;
        let backgroundEnabled = true;
        
        // Set pixelated rendering as default and permanent
        img.style.imageRendering = 'pixelated';
        
        // Update image info when loaded
        img.onload = function() {
            console.log('Image loaded:', img.naturalWidth, 'x', img.naturalHeight);
            dimensions.textContent = \`\${img.naturalWidth} × \${img.naturalHeight} pixels\`;
            updateInfo();
        };
        
        // Re-fit when window is resized (reset zoom only)
        window.addEventListener('resize', function() {
            console.log('Window resized, resetting zoom...');
            if (scale !== 1) {
                resetZoom();
            }
        });
        
        // Zoom functionality
        img.addEventListener('wheel', function(e) {
            e.preventDefault();
            const rect = img.getBoundingClientRect();
            const offsetX = e.clientX - rect.left;
            const offsetY = e.clientY - rect.top;
            
            const delta = e.deltaY > 0 ? 0.9 : 1.1;
            const newScale = Math.max(0.1, Math.min(10, scale * delta));
            
            if (newScale !== scale) {
                scale = newScale;
                img.style.transform = \`scale(\${scale})\`;
                img.style.transformOrigin = \`\${offsetX}px \${offsetY}px\`;
                zoomInfo.textContent = \`\${Math.round(scale * 100)}%\`;
            }
        });
        
        // Control functions
        function toggleBackground() {
            backgroundEnabled = !backgroundEnabled;
            img.style.background = backgroundEnabled ? 
                'linear-gradient(45deg, #ccc 25%, transparent 25%), linear-gradient(-45deg, #ccc 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #ccc 75%), linear-gradient(-45deg, transparent 75%, #ccc 75%)' : 
                'none';
            backgroundBtn.classList.toggle('active', backgroundEnabled);
        }
        
        function resetZoom() {
            scale = 1;
            img.style.transform = 'scale(1)';
            img.style.transformOrigin = 'center';
            zoomInfo.textContent = '100%';
        }
        
        function openExternalEditor() {
            console.log('openExternalEditor function called');
            
            // Check if vscode API is available
            if (typeof vscode === 'undefined') {
                console.error('VS Code API not available in webview');
                alert('VS Code API not available. Please check the console for errors.');
                return;
            }
            
            console.log('Sending message to extension with image data length:', img.src.length);
            
            // Send message to extension to handle external editing
            try {
                vscode.postMessage({
                    command: 'openExternalEditor',
                    imageData: img.src
                });
                console.log('Message sent successfully');
            } catch (error) {
                console.error('Failed to send message:', error);
                alert('Failed to send message to extension: ' + error);
            }
        }
        
        function exportToPng() {
            console.log('exportToPng function called');
            
            // Check if vscode API is available
            if (typeof vscode === 'undefined') {
                console.error('VS Code API not available in webview');
                alert('VS Code API not available. Please check the console for errors.');
                return;
            }
            
            console.log('Sending message to export sprite to PNG');
            
            try {
                vscode.postMessage({
                    command: 'exportToPng',
                    imageData: img.src
                });
                console.log('Export PNG message sent successfully');
            } catch (error) {
                console.error('Failed to send export message:', error);
                alert('Failed to export to PNG: ' + error);
            }
        }
        
        function importFromPng() {
            console.log('importFromPng function called');
            
            // Check if vscode API is available
            if (typeof vscode === 'undefined') {
                console.error('VS Code API not available in webview');
                alert('VS Code API not available. Please check the console for errors.');
                return;
            }
            
            console.log('Sending message to import PNG to sprite');
            
            try {
                vscode.postMessage({
                    command: 'importFromPng'
                });
                console.log('Import PNG message sent successfully');
            } catch (error) {
                console.error('Failed to send import message:', error);
                alert('Failed to import from PNG: ' + error);
            }
        }
        
    </script>
</body>
</html>`;
    }

    /**
     * Generate error webview content
     */
    private getErrorWebviewContent(errorMessage: string, fileName: string): string {
        return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>D2R Sprite Viewer - Error</title>
    <style>
        body {
            margin: 0;
            padding: 40px;
            font-family: var(--vscode-font-family);
            background-color: var(--vscode-editor-background);
            color: var(--vscode-editor-foreground);
            text-align: center;
        }
        .error-container {
            max-width: 600px;
            margin: 0 auto;
            padding: 30px;
            border: 1px solid var(--vscode-errorForeground);
            border-radius: 8px;
            background: var(--vscode-inputValidation-errorBackground);
        }
        .error-icon {
            font-size: 48px;
            margin-bottom: 20px;
        }
        .error-title {
            font-size: 24px;
            margin-bottom: 15px;
            color: var(--vscode-errorForeground);
        }
        .error-message {
            font-size: 16px;
            margin-bottom: 20px;
            color: var(--vscode-descriptionForeground);
        }
        .file-name {
            font-family: var(--vscode-editor-font-family);
            background: var(--vscode-input-background);
            padding: 10px;
            border-radius: 4px;
            border: 1px solid var(--vscode-input-border);
        }
    </style>
</head>
<body>
    <div class="error-container">
        <div class="error-icon">⚠️</div>
        <h1 class="error-title">Failed to Load Sprite</h1>
        <p class="error-message">${errorMessage}</p>
        <div class="file-name">${fileName}</div>
    </div>
</body>
</html>`;
    }

    // Copy sprite conversion methods from webview-sprite-preview.ts
    private async convertSpriteToPng(spriteData: Buffer): Promise<Buffer> {
        const { createCanvas } = require('canvas');
        
        const header = this.parseD2RSpriteHeader(spriteData);
        const pixelData = this.extractD2RPixelData(spriteData, header);
        const rgbaData = this.convertBGRAToRGBA(pixelData, header.width, header.height);
        
        const canvas = createCanvas(header.width, header.height);
        const ctx = canvas.getContext('2d');
        
        const imageData = ctx.createImageData(header.width, header.height);
        imageData.data.set(rgbaData);
        ctx.putImageData(imageData, 0, 0);
        
        return canvas.toBuffer('image/png');
    }
    
    private parseD2RSpriteHeader(data: Buffer) {
        if (data.length < 16) {
            throw new Error('File too small to contain valid D2R sprite header');
        }
        
        const magic = data.toString('ascii', 0, 4);
        if (magic !== 'SpA1' && magic !== 'SPa1') {
            throw new Error(`Invalid D2R sprite magic: expected 'SpA1' or 'SPa1', got '${magic}'`);
        }
        
        const version = data.readUInt16LE(4);
        const width = data.readUInt16LE(6);
        const height = data.readUInt16LE(8);
        
        if (width <= 0 || height <= 0 || width > 4096 || height > 4096) {
            throw new Error(`Invalid dimensions: ${width}x${height}`);
        }
        
        return { magic, version, width, height, pixelDataOffset: 0x28 };
    }
    
    private extractD2RPixelData(data: Buffer, header: any): Buffer {
        const pixelDataStart = header.pixelDataOffset;
        const expectedSize = header.width * header.height * 4;
        
        if (pixelDataStart + expectedSize > data.length) {
            const availableData = data.slice(pixelDataStart);
            const paddedData = Buffer.alloc(expectedSize);
            availableData.copy(paddedData, 0, 0, Math.min(availableData.length, expectedSize));
            return paddedData;
        }
        
        return data.slice(pixelDataStart, pixelDataStart + expectedSize);
    }
    
    private convertBGRAToRGBA(bgraData: Buffer, width: number, height: number): Buffer {
        const pixelCount = width * height;
        const rgbaData = Buffer.alloc(pixelCount * 4);
        
        for (let i = 0; i < pixelCount; i++) {
            const bgraOffset = i * 4;
            const rgbaOffset = i * 4;
            
            rgbaData[rgbaOffset] = bgraData[bgraOffset + 2]; // R = B
            rgbaData[rgbaOffset + 1] = bgraData[bgraOffset + 1]; // G = G
            rgbaData[rgbaOffset + 2] = bgraData[bgraOffset]; // B = R
            rgbaData[rgbaOffset + 3] = bgraData[bgraOffset + 3]; // A = A
        }
        
        return rgbaData;
    }

    /**
     * Handle external editing workflow
     */
    private async handleExternalEdit(document: vscode.CustomDocument, imageData: string): Promise<void> {
        try {
            console.log('Starting external edit process...');
            
            // Extract base64 data and convert to buffer
            const base64Data = imageData.replace(/^data:image\/png;base64,/, '');
            const pngBuffer = Buffer.from(base64Data, 'base64');
            
            // Create temporary PNG file
            const originalPath = document.uri.fsPath;
            const tempDir = path.dirname(originalPath);
            const baseName = path.basename(originalPath, '.sprite');
            const tempPngPath = path.join(tempDir, `${baseName}.png`);
            
            console.log('Temp PNG path:', tempPngPath);
            console.log('PNG buffer size:', pngBuffer.length);
            
            // Write PNG file
            fs.writeFileSync(tempPngPath, pngBuffer);
            console.log('PNG file written successfully');
            
            // Verify file was created
            if (!fs.existsSync(tempPngPath)) {
                throw new Error('Failed to create temporary PNG file');
            }
            
            // Show information message
            const action = await vscode.window.showInformationMessage(
                `PNG exported to: ${tempPngPath}\n\nThe file will open in your default image editor. Make your changes and save. The sprite will be automatically updated when you save the PNG.`,
                'Open PNG', 'Show in Explorer', 'Cancel'
            );
            
            if (action === 'Open PNG') {
                // Open the PNG file in Paint.NET specifically
                try {
                    console.log('Attempting to open PNG in Paint.NET');
                    console.log('PNG path:', tempPngPath);
                    
                    const paintNetPath = 'C:\\Program Files\\paint.net\\paintdotnet.exe';
                    
                    // Check if Paint.NET exists
                    if (!fs.existsSync(paintNetPath)) {
                        throw new Error(`Paint.NET not found at: ${paintNetPath}`);
                    }
                    
                    // Primary method: Use spawn to open in Paint.NET
                    try {
                        const child = spawn(paintNetPath, [tempPngPath], {
                            detached: true,
                            stdio: 'ignore'
                        });
                        child.unref();
                        vscode.window.showInformationMessage(`Opened ${path.basename(tempPngPath)} in Paint.NET. Make changes and save to update the sprite.`);
                        console.log('PNG opened in Paint.NET successfully');
                    } catch (spawnError) {
                        console.log('Paint.NET spawn failed, trying exec method:', spawnError);
                        // Fallback: Use exec method
                        const execAsync = promisify(exec);
                        await execAsync(`"${paintNetPath}" "${tempPngPath}"`);
                        vscode.window.showInformationMessage(`Opened ${path.basename(tempPngPath)} in Paint.NET. Make changes and save to update the sprite.`);
                        console.log('PNG opened in Paint.NET using exec method');
                    }
                } catch (error) {
                    console.error('Paint.NET opening failed:', error);
                    vscode.window.showErrorMessage(`Failed to open PNG in Paint.NET: ${error}`);
                    
                    // Fallback: Try alternative Paint.NET locations or default system handler
                    try {
                        console.log('Trying alternative Paint.NET locations and fallback methods...');
                        
                        // Try alternative Paint.NET installation paths
                        const alternativePaths = [
                            'C:\\Program Files (x86)\\paint.net\\paintdotnet.exe',
                            'C:\\Program Files\\Paint.NET\\PaintDotNet.exe',
                            'C:\\Program Files (x86)\\Paint.NET\\PaintDotNet.exe'
                        ];
                        
                        let opened = false;
                        for (const altPath of alternativePaths) {
                            if (fs.existsSync(altPath)) {
                                console.log('Found Paint.NET at alternative location:', altPath);
                                const child = spawn(altPath, [tempPngPath], {
                                    detached: true,
                                    stdio: 'ignore'
                                });
                                child.unref();
                                vscode.window.showInformationMessage(`Opened ${path.basename(tempPngPath)} in Paint.NET (${altPath}). Make changes and save to update the sprite.`);
                                opened = true;
                                break;
                            }
                        }
                        
                        if (!opened) {
                            // Final fallback: Use system default
                            console.log('Paint.NET not found, using system default...');
                            const uri = vscode.Uri.file(tempPngPath);
                            await vscode.env.openExternal(uri);
                            vscode.window.showInformationMessage(`Paint.NET not found. Opened ${path.basename(tempPngPath)} with system default image editor. Make changes and save to update the sprite.`);
                        }
                    } catch (fallbackError) {
                        console.error('All fallback methods failed:', fallbackError);
                        
                        // Final fallback: Use VS Code itself
                        try {
                            const uri = vscode.Uri.file(tempPngPath);
                            await vscode.window.showTextDocument(uri);
                            vscode.window.showInformationMessage(`Opened PNG in VS Code as final fallback. Manual path: ${tempPngPath}`);
                        } catch (vscodeError) {
                            vscode.window.showErrorMessage(`Could not open PNG file at all: ${vscodeError}. Manual path: ${tempPngPath}`);
                        }
                    }
                }
                
                // Start watching for changes to the PNG file
                this.watchPngForChanges(tempPngPath, originalPath);
                
            } else if (action === 'Show in Explorer') {
                // Show file in file explorer
                try {
                    if (process.platform === 'win32') {
                        await promisify(exec)(`explorer /select,"${tempPngPath}"`);
                    } else if (process.platform === 'darwin') {
                        await promisify(exec)(`open -R "${tempPngPath}"`);
                    } else {
                        // For Linux, open the containing directory
                        await promisify(exec)(`xdg-open "${path.dirname(tempPngPath)}"`);
                    }
                    vscode.window.showInformationMessage(`File location shown in explorer: ${tempPngPath}`);
                } catch (error) {
                    vscode.window.showErrorMessage(`Failed to show in explorer: ${error}`);
                }
            }
            
        } catch (error) {
            vscode.window.showErrorMessage(`Failed to export PNG: ${error}`);
        }
    }

    /**
     * Watch PNG file for changes and update sprite when modified
     */
    private watchPngForChanges(pngPath: string, spritePath: string): void {
        let isProcessing = false; // Prevent multiple simultaneous conversions
        
        const watcher = fs.watch(pngPath, (eventType, filename) => {
            if (eventType === 'change' && !isProcessing) {
                isProcessing = true;
                // Debounce multiple change events
                setTimeout(async () => {
                    try {
                        console.log('PNG file changed, starting conversion...');
                        await this.updateSpriteFromPng(pngPath, spritePath);
                    } catch (error) {
                        console.error('Sprite update failed:', error);
                        vscode.window.showErrorMessage(`Failed to update sprite: ${error}`);
                    } finally {
                        isProcessing = false;
                    }
                }, 1000); // Increased debounce time to ensure file is fully written
            }
        });

        // Clean up watcher after 30 minutes to prevent memory leaks
        setTimeout(() => {
            watcher.close();
            console.log('PNG file watcher closed after timeout');
        }, 30 * 60 * 1000);
        
        // Show helpful message to user
        vscode.window.showInformationMessage(
            `Watching for changes to ${path.basename(pngPath)}. Changes will automatically update the sprite file.`,
            'Stop Watching'
        ).then(action => {
            if (action === 'Stop Watching') {
                watcher.close();
                console.log('PNG file watcher closed by user');
            }
        });
    }

    /**
     * Update sprite file from modified PNG
     */
    private async updateSpriteFromPng(pngPath: string, spritePath: string): Promise<void> {
        try {
            console.log('Starting PNG to sprite conversion...');
            console.log('PNG path:', pngPath);
            console.log('Sprite path:', spritePath);
            
            // Check if PNG file exists
            if (!fs.existsSync(pngPath)) {
                throw new Error(`PNG file not found: ${pngPath}`);
            }
            
            // Read the original sprite file to get header information
            const originalSpriteData = fs.readFileSync(spritePath);
            const originalHeader = this.parseD2RSpriteHeader(originalSpriteData);
            console.log('Original sprite header:', originalHeader);
            
            // Read and process the PNG file
            const { createCanvas, loadImage } = require('canvas');
            const image = await loadImage(pngPath);
            
            console.log('PNG dimensions:', image.width, 'x', image.height);
            
            // Validate dimensions match original sprite
            if (image.width !== originalHeader.width || image.height !== originalHeader.height) {
                throw new Error(
                    `PNG dimensions (${image.width}x${image.height}) don't match original sprite (${originalHeader.width}x${originalHeader.height}). ` +
                    `Please ensure the PNG maintains the original dimensions.`
                );
            }
            
            // Create canvas and extract pixel data
            const canvas = createCanvas(image.width, image.height);
            const ctx = canvas.getContext('2d');
            ctx.drawImage(image, 0, 0);
            
            const imageData = ctx.getImageData(0, 0, image.width, image.height);
            const rgbaData = imageData.data;
            
            // Convert RGBA to BGRA format (D2R sprites use BGRA)
            const bgraData = this.convertRGBAToBGRA(Buffer.from(rgbaData), image.width, image.height);
            
            // Create new sprite file with updated pixel data
            const newSpriteData = this.createD2RSpriteFile(originalHeader, bgraData, originalSpriteData);
            
            // Create backup of original sprite
            const backupPath = spritePath + '.backup';
            fs.writeFileSync(backupPath, originalSpriteData);
            
            // Write the new sprite file
            fs.writeFileSync(spritePath, newSpriteData);
            
            console.log('PNG to sprite conversion completed successfully');
            vscode.window.showInformationMessage(
                `Sprite updated successfully from PNG! Original backed up to: ${path.basename(backupPath)}`
            );
            
        } catch (error) {
            console.error('PNG to sprite conversion failed:', error);
            throw new Error(`Failed to convert PNG back to sprite: ${error}`);
        }
    }

    /**
     * Convert RGBA pixel data to BGRA format
     */
    private convertRGBAToBGRA(rgbaData: Buffer, width: number, height: number): Buffer {
        const pixelCount = width * height;
        const bgraData = Buffer.alloc(pixelCount * 4);
        
        for (let i = 0; i < pixelCount; i++) {
            const rgbaOffset = i * 4;
            const bgraOffset = i * 4;
            
            bgraData[bgraOffset] = rgbaData[rgbaOffset + 2];     // B = R
            bgraData[bgraOffset + 1] = rgbaData[rgbaOffset + 1]; // G = G
            bgraData[bgraOffset + 2] = rgbaData[rgbaOffset];     // R = B
            bgraData[bgraOffset + 3] = rgbaData[rgbaOffset + 3]; // A = A
        }
        
        return bgraData;
    }

    /**
     * Create a complete D2R sprite file with header and pixel data
     */
    private createD2RSpriteFile(originalHeader: any, pixelData: Buffer, originalSpriteData: Buffer): Buffer {
        const headerSize = 0x28; // 40 bytes for D2R sprite header
        const totalSize = headerSize + pixelData.length;
        const spriteBuffer = Buffer.alloc(totalSize);
        
        // Write essential header fields
        spriteBuffer.write(originalHeader.magic, 0, 4, 'ascii');           // Magic bytes (4 bytes)
        spriteBuffer.writeUInt16LE(originalHeader.version, 4);             // Version (2 bytes)
        spriteBuffer.writeUInt16LE(originalHeader.width, 6);               // Width (2 bytes)
        spriteBuffer.writeUInt16LE(originalHeader.height, 8);              // Height (2 bytes)
        
        // For bytes 10-39, preserve the original header structure
        // This ensures compatibility with any additional D2R-specific metadata
        if (originalSpriteData.length >= headerSize) {
            // Copy remaining header bytes from original file
            for (let i = 10; i < headerSize; i++) {
                spriteBuffer[i] = originalSpriteData[i];
            }
        } else {
            // Fill with zeros if original data is insufficient
            for (let i = 10; i < headerSize; i++) {
                spriteBuffer[i] = 0;
            }
        }
        
        // Write pixel data starting at offset 0x28
        pixelData.copy(spriteBuffer, headerSize);
        
        console.log(`Created sprite file: ${totalSize} bytes (${headerSize} header + ${pixelData.length} pixels)`);
        
        return spriteBuffer;
    }

    /**
     * Handle export sprite to PNG
     */
    private async handleExportToPng(document: vscode.CustomDocument, imageData: string): Promise<void> {
        try {
            console.log('Handling PNG export request');
            
            // Extract base64 data from data URL
            const base64Match = imageData.match(/^data:image\/png;base64,(.+)$/);
            if (!base64Match) {
                throw new Error('Invalid image data format');
            }
            
            const base64Data = base64Match[1];
            const pngBuffer = Buffer.from(base64Data, 'base64');
            
            // Create PNG file next to sprite
            const originalPath = document.uri.fsPath;
            const dirPath = path.dirname(originalPath);
            const baseName = path.basename(originalPath, '.sprite');
            const pngPath = path.join(dirPath, `${baseName}.png`);
            
            // Write PNG file
            fs.writeFileSync(pngPath, pngBuffer);
            
            vscode.window.showInformationMessage(`Sprite exported to: ${path.basename(pngPath)}`);
            console.log('PNG export completed successfully');
            
        } catch (error) {
            console.error('Export to PNG failed:', error);
            vscode.window.showErrorMessage(`Failed to export to PNG: ${error}`);
        }
    }

    /**
     * Handle import PNG to sprite
     */
    private async handleImportFromPng(document: vscode.CustomDocument): Promise<void> {
        try {
            console.log('Handling PNG import request');
            
            // Show file picker for PNG file
            const pngFiles = await vscode.window.showOpenDialog({
                canSelectFiles: true,
                canSelectFolders: false,
                canSelectMany: false,
                filters: {
                    'PNG Images': ['png']
                },
                title: 'Select PNG file to import'
            });
            
            if (!pngFiles || pngFiles.length === 0) {
                return; // User cancelled
            }
            
            const pngPath = pngFiles[0].fsPath;
            const spritePath = document.uri.fsPath;
            
            // Update sprite from PNG
            await this.updateSpriteFromPng(pngPath, spritePath);
            
            vscode.window.showInformationMessage(`PNG imported successfully from: ${path.basename(pngPath)}`);
            console.log('PNG import completed successfully');
            
            // Reload the webview by triggering a document change event
            // This will cause VS Code to reload the custom editor
            const edit = new vscode.WorkspaceEdit();
            edit.set(document.uri, []);
            await vscode.workspace.applyEdit(edit);
            
        } catch (error) {
            console.error('Import from PNG failed:', error);
            vscode.window.showErrorMessage(`Failed to import from PNG: ${error}`);
        }
    }
}
