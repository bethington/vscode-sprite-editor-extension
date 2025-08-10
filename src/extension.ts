import * as vscode from 'vscode';
import { SpriteEditorProvider } from './sprite-editor-provider';

export function activate(context: vscode.ExtensionContext) {
	console.log('D2R Sprite Editor extension is being activated...');
	
	// Set up file association for .sprite files
	const config = vscode.workspace.getConfiguration();
	const editorAssociations = config.get('workbench.editorAssociations') as Record<string, string> || {};
	if (!editorAssociations['*.sprite']) {
		editorAssociations['*.sprite'] = 'd2rmodding.spriteViewer';
		config.update('workbench.editorAssociations', editorAssociations, vscode.ConfigurationTarget.Workspace);
		console.log('Set file association for .sprite files');
	}
	
	// Register custom editor provider for .sprite files
	const provider = new SpriteEditorProvider(context);
	const registration = vscode.window.registerCustomEditorProvider('d2rmodding.spriteViewer', provider, {
		webviewOptions: {
			retainContextWhenHidden: true,
		},
		supportsMultipleEditorsPerDocument: false,
	});
	
	// Register command to open sprite files directly
	const openSpriteCommand = vscode.commands.registerCommand('d2rmodding.openSprite', async (uri: vscode.Uri) => {
		if (uri && uri.fsPath) {
			// Force open with our custom editor
			await vscode.commands.executeCommand('vscode.openWith', uri, 'd2rmodding.spriteViewer');
		}
	});
	
	context.subscriptions.push(registration);
	context.subscriptions.push(openSpriteCommand);
	
	console.log('D2R Sprite Editor extension activated successfully');
}

export function deactivate() {
	console.log('D2R Sprite Editor extension is being deactivated...');
}
