import * as vscode from 'vscode';
import * as path from 'path';
import * as fs from 'fs';
import {Maze} from './maze.js';

class MazeState {
  sbi: vscode.StatusBarItem;
  maze: Maze =new Maze(5, 3);
  constructor(private readonly webView: vscode.Webview) {
    this.sbi = vscode.window.createStatusBarItem();
    this.sbi.command = {
        title: "solve the maze",
        command: "maze.solve",
        arguments: [this]
    } as vscode.Command;
    for(const d of this.maze.clear()) {}
    for(const d of this.maze.generate()) {
      this.updateStatusBarItem(this.sbi, this.maze.usedCells, this.maze.totalCells);
    }
  }
  dispose(): void {
    this.sbi.dispose();
  }
  solve(): void {
    console.log("solving");
    for(const x of this.maze.solve()) {}
    this.drawCells();
  }
  draw(): void {
    this.drawWalls();
    this.drawCells();
  }
  drawWalls(): void {
    for(let cursorDirectionAndOpen of this.maze.allWalls()) {
      const cursor = cursorDirectionAndOpen[0];
      const dir = cursorDirectionAndOpen[1];
      const open = cursorDirectionAndOpen[2];
      this.webView.postMessage({
        command: "drawWall",
        row: cursor.row,
        col: cursor.col,
        dir: dir,
        open: open
      });
    }
  }
  drawCells(): void {
    for(let cursorAndOpen of this.maze.allCells()) {
      const cursor = cursorAndOpen.cursor;
      const open = cursorAndOpen.open;
      this.webView.postMessage({
        command: "drawCell",
        row: cursor.row,
        col: cursor.col,
        open: open
      });
    }
  }
  updateStatusBarItem(sbi: vscode.StatusBarItem, used: number, total: number) {
    if (sbi) {
      sbi.text = "Maze " + used + "/" + total + " (used/total)";
      sbi.show();
    }
  }
  onDidReceiveMessage(message:any): void {
    switch(message.command) {
      case "alert":
        vscode.window.showInformationMessage("Webview alert: ".concat(JSON.stringify(message)));  
        break;
      case "status":
        this.updateStatusBarItem(this.sbi, message.used, message.total);
        break;
      case "getDimensions":
        this.webView.postMessage({command: "dimensions", width: this.maze.width, height: this.maze.height});
        break;
      case "getState":
        this.draw();
        break;
    }
  }
}

export function activate(context: vscode.ExtensionContext) {
  console.log("activated");
  context.subscriptions.push(
    
    vscode.commands.registerCommand('maze.generate', () => {

      // Create and show a new webview
      var panel: vscode.WebviewPanel | undefined = vscode.window.createWebviewPanel(
        'maze', // Identifies the type of the webview. Used internally
        'Maze', // Title of the panel displayed to the user
        vscode.ViewColumn.One, // Editor column to show the new webview panel in.
        {
          // localResourceRoots: [],
          enableScripts: true,
          //localResourceRoots: [vscode.Uri.joinPath(context.extensionUri, 'media')]
        } // Webview options. No local resource access.
      );
      const mazeState = new MazeState(panel.webview);
      (panel as any)._mazeState = mazeState;

      panel.webview.onDidReceiveMessage(message => {
        mazeState.onDidReceiveMessage(message);
      });
      getWebviewContent(context, panel);
      panel.onDidDispose(() => {
        mazeState.dispose();
      });
    }),
    vscode.commands.registerCommand('maze.solve', (mazeState: MazeState) => {
      mazeState.solve();
    })
  );
}

function getWebviewContent(context: vscode.ExtensionContext, panel: vscode.WebviewPanel): void {
  const htmlPath: vscode.Uri = vscode.Uri.file(path.join(context.extensionPath, 'html', 'index.html'));
  const mazePath: vscode.Uri = vscode.Uri.file(path.join(context.extensionPath, 'dist', 'maze.js'));
  const mazeUri: vscode.Uri = panel.webview.asWebviewUri(mazePath);

  var html = fs.readFileSync(htmlPath.fsPath, 'utf8');
  html = html.replace("${maze_js}", mazeUri.toString());
  panel.webview.html = html;
}