'use strict';
// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import {StashTreeProvider} from "./providers/StashTreeProvider";

let fsWatcher: vscode.FileSystemWatcher;
// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {
	const gitStashProvider = new StashTreeProvider(vscode.workspace.rootPath);
	vscode.window.registerTreeDataProvider("gitStash", gitStashProvider);
	fsWatcher = vscode.workspace.createFileSystemWatcher("*");
	console.log("fsWatcher created.");
	fsWatcher.onDidChange((event) => {
		console.log("fs chage event fired");
		gitStashProvider.refresh();
	});
}

// this method is called when your extension is deactivated
export function deactivate() {
	fsWatcher.dispose();
}