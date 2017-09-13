'use strict';
import * as vscode from 'vscode';
import {StashTreeProvider} from "./providers/StashTreeProvider";

let refreshTimeout;
export function activate(context: vscode.ExtensionContext) {
	const gitStashProvider = new StashTreeProvider(vscode.workspace.rootPath);
	vscode.window.registerTreeDataProvider("gitStash", gitStashProvider);
	setInterval(() => {
		gitStashProvider.refresh();
	}, 3000);


}

// this method is called when your extension is deactivated
export function deactivate() {
}