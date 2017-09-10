import * as vscode from "vscode";
import * as cp from "child_process";

export class StashTreeProvider implements vscode.TreeDataProvider<vscode.TreeItem> {
	constructor(private workspaceRoot: string) {
	}

	getChildren(stash?: Stash): Thenable<vscode.TreeItem[]> {
		if (stash) {
			if (stash instanceof Stash) {
				return new Promise<vscode.TreeItem[]>((resolve, reject) => {
					cp.exec("git stash show " + stash.id, {
						cwd: this.workspaceRoot
					}, (err, stdout) => {
						if (err) {
							console.log(err);
							return reject("error running git stash show");
						}
						return resolve(stdout.trim().split("\n").map((line) => new vscode.TreeItem(line)));
					});
				});
			} else {
				return Promise.resolve([]);
			}
		}
		return new Promise<Stash[]>((resolve, reject) => {
			cp.exec("git stash list", {
				cwd: this.workspaceRoot
			}, (err, stdout) => {
				if (err) {
					console.log(err);
					return reject('git not found');
				}
				const arr = stdout.trim().split("\n");
				return resolve(arr.map((item) => {
					const comps = item.split(":");
					const id = comps[0].split("{")[1].split("}")[0];
					const branch = comps[1].trim().split("WIP on ")[0];
					const commit = comps[2].trim().split(" ")[0];
					return this.createItem(branch, commit, id, item);
				}));
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

	// iconPath = {
	// 	light: path.join(__filename, '..', '..', '..', 'resources', 'light', 'dependency.svg'),
	// 	dark: path.join(__filename, '..', '..', '..', 'resources', 'dark', 'dependency.svg')
	// };

	contextValue = 'stash';
}