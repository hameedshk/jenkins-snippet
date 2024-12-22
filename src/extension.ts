// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';

import * as fs from 'fs';
import * as path from 'path';
import * as fsp from 'fs/promises';

let parentDir = '';

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

function getCurrentProgrammingLanguage(): string {
	const editor = vscode.window.activeTextEditor;
	//https://code.visualstudio.com/docs/languages/identifiers
	if (!editor) {
		vscode.window.showErrorMessage('No active editor detected.');
		return 'Unknown';
	}

	// Retrieve the language ID of the current document
	const languageId = editor.document.languageId;

	// Display the detected language
	vscode.window.showInformationMessage(`Current programming language: ${languageId}`);
	return languageId;
}

function getJenkinsFileSnippetpath(languageId: string): string {
	return path.join(parentDir, "src/snippets", "csharp", "Jenkinsfile");

}

async function CopySnippettoRoot(src: string, dest: string) {
	/*try {
	  // Ensure source file exists
	  await fsp.access(src);
  
	  // Create destination directory if it doesn't exist
	  const destDir = path.dirname(dest);
	  await fsp.mkdir(destDir, { recursive: true });
  
	  // Perform the copy operation
	  await fsp.copyFile(src, dest);
	  console.log(`File copied from ${src} to ${dest}`);
	} catch (erro) {
	  console.error( `Error copying file: ${erro.message}`);
	  if (err.code === 'EPERM') {
		console.error('Permission error. Ensure you have the necessary access rights.');
	  }
	}*/
}

// This method is called when your extension is activated
// Your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {

	// Use the console to output diagnostic information (console.log) and errors (console.error)
	// This line of code will only be executed once when your extension is activated
	console.log('Congratulations, your extension "jenkins-snippet" is now active!');

	// The command has been defined in the package.json file
	// Now provide the implementation of the command with registerCommand
	// The commandId parameter must match the command field in package.json
	const disposable = vscode.commands.registerCommand('jenkins-snippet.helloWorld', async () => {
		// The code you place here will be executed every time your command is executed

		// 1.Get the current language ID
		const language = getCurrentProgrammingLanguage();
		// 2.get the rootpath of the project
		const rootDir = findProjectRoot(__dirname);
		console.log(`Project root directory: ${rootDir}`);
		//3.get the snippet path as per the language
		const jenkinsFilePath = getJenkinsFileSnippetpath(language);
		//4.insert the detected code snippet in the root folder

		const wsedit = new vscode.WorkspaceEdit();

		//read content of jenkinssnippet
		const content = fs.readFileSync(jenkinsFilePath, "utf-8");

		//create a file 
		const destFile = rootDir + "/Jenkinsfile";
		wsedit.createFile(vscode.Uri.file(destFile), { ignoreIfExists: true });

		//write to the created file
		fs.writeFileSync(destFile, content, 'utf8');

		vscode.workspace.applyEdit(wsedit);

		var openPath = vscode.Uri.parse("file:///" + destFile); //A request file path

		vscode.workspace.openTextDocument(openPath).then(doc => {
			vscode.window.showTextDocument(doc);
		});

		vscode.window.showInformationMessage('Hello World from jenkins-snippet!');
	});


	context.subscriptions.push(disposable);
}

// This method is called when your extension is deactivated
export function deactivate() { }
