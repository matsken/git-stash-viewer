"use strict";

import * as vscode from "vscode";
import * as cp from "child_process";

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
					const cmd = "git stash show " + (stash.id + "");
					cp.exec(cmd, {
						cwd: this.workspaceRoot
					}, (err, stdout) => {
						if (err) {
							console.log(err);
							reject("Error running command: " + cmd);
						} else {
							resolve(stdout.trim().split("\n").map((line) => new vscode.TreeItem(line)));
						}
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
					resolve(arr.map((item) => {
						const comps = item.split(":");
						const id = comps[0].split("{")[1].split("}")[0];
						let branch = "", commit = "";
						if (comps.length > 2) {
							branch = comps[1].trim().split("WIP on ")[0];
							commit = comps[2].trim().split(" ")[0];
						}
						return this.createItem(branch, commit, id, item);
					}));
				}
			});
		});
	}

	getTreeItem(stash: Stash): vscode.TreeItem {
		return stash;
	}

	createItem(branch, commit, id, label) {
		return new Stash(branch, commit, id, label, vscode.TreeItemCollapsibleState.Collapsed);
	}
}

class Stash extends vscode.TreeItem {
	constructor(
		public readonly branch: string,
		public readonly commit: string,
		public readonly id: number,
		public readonly label: string,
		public readonly collapsibleState: vscode.TreeItemCollapsibleState,
		public readonly command?: vscode.Command,
	) {
		super(label, collapsibleState);
	}
	contextValue = 'stash';
}