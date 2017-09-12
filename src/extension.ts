'use strict';
import * as vscode from 'vscode';
import {StashTreeProvider} from "./providers/StashTreeProvider";

let fsWatcher: vscode.FileSystemWatcher;
let refreshTimeout;
export function activate(context: vscode.ExtensionContext) {
	const gitStashProvider = new StashTreeProvider(vscode.workspace.rootPath);
	vscode.window.registerTreeDataProvider("gitStash", gitStashProvider);
	fsWatcher = vscode.workspace.createFileSystemWatcher("**/*");
	fsWatcher.onDidChange((event) => {
		// prevent successive refreshes
		clearTimeout(refreshTimeout);
		refreshTimeout = setTimeout(() => {
			gitStashProvider.refresh();
		}, 1000);
	});
}

// this method is called when your extension is deactivated
export function deactivate() {
	fsWatcher.dispose();
}