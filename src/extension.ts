// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';

import * as fs from 'fs';
import * as path from 'path';
import * as fsp from 'fs/promises';

let parentDir = '';
const supportedLanguages: string[] = ['csharp','java','python'];


function findProjectRoot(startPath: string, markers: string[] = ['package.json', '.git']): string {
	let currentDir = path.resolve(startPath);
	while (true) {
		if (markers.some(marker => fs.existsSync(path.join(currentDir, marker)))) {
			return currentDir; // Root folder found
		}
		parentDir = path.dirname(currentDir);

		if (currentDir === parentDir) {
			throw new Error('Project root not found. No marker files detected.');
		}
		currentDir = parentDir;
	}
}

function getCurrentProgrammingLanguage(context: vscode.ExtensionContext): string {
	const editor = vscode.window.activeTextEditor;
	//https://code.visualstudio.com/docs/languages/identifiers
	if (!editor) {
		vscode.window.showErrorMessage('No active editor detected.');
		return 'Unknown';
	}
	// Retrieve the language ID of the current document
	const languageId = editor.document.languageId;
	if(supportedLanguages.indexOf(languageId)<0){
		vscode.window.showInformationMessage('Lanaguage is not supported');
		vscode.commands.registerCommand('extension.exitCommand', () => {
			throw new Error('Exiting the extension');
		});
	}
	// Display the detected language
	vscode.window.showInformationMessage(`Current programming language: ${languageId}`);
	return languageId;
}

function getJenkinsFileSnippetpath(languageId: string): string {
	return path.join(parentDir, "src/snippets", languageId, "Jenkinsfile");
}

function writetoJenkinsFileSnippet(rootDir: string, snippetFilePath: string) {
	const wsedit = new vscode.WorkspaceEdit();

	//read content of jenkinssnippet
	const content = fs.readFileSync(snippetFilePath, "utf-8");
	//create a file 
	const destinationFilePath=path.join(rootDir,"Jenkinsfile");
	wsedit.createFile(vscode.Uri.file(destinationFilePath), { ignoreIfExists: true });

	//write to the created file
	fs.writeFileSync(rootDir, content, 'utf8');
	vscode.workspace.applyEdit(wsedit);
}

// This method is called when your extension is activated
// Your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {

	// Use the console to output diagnostic information (console.log) and errors (console.error)
	// This line of code will only be executed once when your extension is activated
	console.log('Jenkins-snippet is getting activated now!');

	// The command has been defined in the package.json file
	// Now provide the implementation of the command with registerCommand
	// The commandId parameter must match the command field in package.json
	const disposable = vscode.commands.registerCommand('jenkins-snippet.jenkins-snippet', async () => {
		// The code you place here will be executed every time your command is executed

		// 1.Get the current language ID
		const language = getCurrentProgrammingLanguage(context);
		// 2.get the rootpath of the project
		const rootDir = findProjectRoot(__dirname);
		console.log(`Project root directory: ${rootDir}`);
		//3.get the snippet path as per the language
		const snippetFilePath = getJenkinsFileSnippetpath(language);
		//4.insert the detected code snippet in the root folder		
		writetoJenkinsFileSnippet(rootDir, snippetFilePath);
		var openPath = vscode.Uri.parse("file:///" + rootDir); //A request file path
		vscode.workspace.openTextDocument(openPath).then(doc => {
			vscode.window.showTextDocument(doc);
		});

		vscode.window.showInformationMessage('jenkins-snippet added successfully, please click save and commit this file!');
	});

	context.subscriptions.push(disposable);
}

// This method is called when your extension is deactivated
export function deactivate() { }
