"use strict";

import * as vscode from "vscode";
import * as cp from "child_process";

const EOL = (process.platform === "win32") ? "\r\n" : "\n";

export class StashTreeProvider implements vscode.TreeDataProvider<vscode.TreeItem> {
	constructor(private workspaceRoot: string) {
	}

	private onDidChangeTreeDataEmitter: vscode.EventEmitter<Stash | undefined | null> = new vscode.EventEmitter<Stash | undefined | null>();
	readonly onDidChangeTreeData: vscode.Event<Stash | undefined | null> = this.onDidChangeTreeDataEmitter.event;

	refresh(): void {
		this.onDidChangeTreeDataEmitter.fire();
	}

	getChildren(stash?: Stash): Thenable<vscode.TreeItem[]> {
		if (stash) {
			if (stash instanceof Stash) {
				return new Promise<vscode.TreeItem[]>((resolve, reject) => {
					const cmd = "git stash show " + (stash.id || "");
					cp.exec(cmd, {
						cwd: this.workspaceRoot
					}, (err, stdout) => {
						let msg = stdout;
						if (err) {
							msg = "Error running command: " + cmd + EOL + err;
						}
						resolve(msg.split(EOL).map((line) => new vscode.TreeItem(line.trim())));
					});
				});
			} else {
				return Promise.resolve([]);
			}
		}
		return new Promise<vscode.TreeItem[]>((resolve, reject) => {
			cp.exec("git stash list", {
				cwd: this.workspaceRoot
			}, (err, stdout) => {
				if (err) {
					console.log(err);
					return reject('git not found');
				}
				const trimmed = stdout.trim();
				if (!trimmed) {
					resolve([new vscode.TreeItem("Nothing stashed")]);
				} else {
					const arr = stdout.trim().split("\n");
					resolve(arr.map((item, index) => {
						return this.createItem(index, item);
					}));
				}
			});
		});
	}

	getTreeItem(stash: Stash): vscode.TreeItem {
		return stash;
	}

	createItem(id, label) {
		return new Stash(id, label, vscode.TreeItemCollapsibleState.Collapsed);
	}
}

class Stash extends vscode.TreeItem {
	constructor(
		public readonly id: number,
		public readonly label: string,
		public readonly collapsibleState: vscode.TreeItemCollapsibleState,
		public readonly command?: vscode.Command,
	) {
		super(label, collapsibleState);
	}
	contextValue = 'stash';
}