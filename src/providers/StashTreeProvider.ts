import * as vscode from "vscode";
import * as cp from "child_process";

export class StashTreeProvider implements vscode.TreeDataProvider<Stash> {
	constructor(private workspaceRoot: string) {
	}

	getChildren(stash?: Stash): Thenable<Stash[]> {
		return new Promise<Stash[]>((resolve, reject) => {
			cp.exec("git stash list", {
				cwd: this.workspaceRoot
			}, (err, stdout) => {
				if (err) {
					console.log(err);
					return reject('git not found');
				}
				return resolve([this.createItem(stdout)]);
			});
		});
	}

	getTreeItem(stash: Stash): vscode.TreeItem {
		return stash;
	}

	createItem(label) {
		return new Stash(label, vscode.TreeItemCollapsibleState.Collapsed);
	}
}

class Stash extends vscode.TreeItem {
	// constructor(
	// 	public readonly label: string,
	// 	public readonly collapsibleState: vscode.TreeItemCollapsibleState,
	// 	public readonly command?: vscode.Command
	// ) {
	// 	super(label, collapsibleState);
	// }

	// iconPath = {
	// 	light: path.join(__filename, '..', '..', '..', 'resources', 'light', 'dependency.svg'),
	// 	dark: path.join(__filename, '..', '..', '..', 'resources', 'dark', 'dependency.svg')
	// };

	contextValue = 'stash';
}