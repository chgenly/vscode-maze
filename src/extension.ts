import * as vscode from 'vscode';
import * as path from 'path';
import * as fs from 'fs';
import { MazeState } from './MazeState.js';

let mazeViewCount =0;

export function activate(context: vscode.ExtensionContext) {
  console.log("activated");
  context.subscriptions.push(
    
    vscode.commands.registerCommand('maze.generate', () => {
      ++mazeViewCount;
      // Create and show a new webview
      var panel: vscode.WebviewPanel | undefined = vscode.window.createWebviewPanel(
        'maze', // Identifies the type of the webview. Used internally
        'Maze '+mazeViewCount, // Title of the panel displayed to the user
        vscode.ViewColumn.One, // Editor column to show the new webview panel in.
        {
          // localResourceRoots: [],
          enableScripts: true,
          //localResourceRoots: [vscode.Uri.joinPath(context.extensionUri, 'media')]
        } // Webview options. No local resource access.
      );
      const mazeState = new MazeState(panel.webview, mazeViewCount);
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