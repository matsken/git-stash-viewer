'use strict';
import * as vscode from 'vscode';
import {StashTreeProvider} from "./providers/StashTreeProvider";

let refreshTimeout;
let watcher: vscode.FileSystemWatcher;
export function activate(context: vscode.ExtensionContext) {
	const gitStashProvider = new StashTreeProvider(vscode.workspace.rootPath);
	vscode.window.registerTreeDataProvider("gitStash", gitStashProvider);
	
	vscode.commands.registerCommand("gitStash.refresh", () => {
		gitStashProvider.refresh();
	})

	watcher = vscode.workspace.createFileSystemWatcher("**/*");
	watcher.onDidChange((event) => {
		clearTimeout(refreshTimeout);
		refreshTimeout = setTimeout(() => {
			gitStashProvider.refresh();
		}, 1000);
	});
}

// this method is called when your extension is deactivated
export function deactivate() {
	watcher.dispose();
}