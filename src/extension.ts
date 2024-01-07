import * as vscode from 'vscode';
import * as path from 'path';
import * as fs from 'fs';
import { MazeState } from './MazeState.js';
import { getDimensions } from './getDimensions';

let mazeViewCount = 0;

const panels: vscode.WebviewPanel[] = [];

export function activate(context: vscode.ExtensionContext) {
  context.subscriptions.push(

    vscode.commands.registerCommand('maze.generate', () => {
      getDimensions()
        .then(dimensions => {
          ++mazeViewCount;
          // Create and show a new webview
          var panel: vscode.WebviewPanel = vscode.window.createWebviewPanel(
            'maze', // Identifies the type of the webview. Used internally
            'Maze ' + mazeViewCount, // Title of the panel displayed to the user
            vscode.ViewColumn.One, // Editor column to show the new webview panel in.
            {
              // localResourceRoots: [],
              enableScripts: true,
              //localResourceRoots: [vscode.Uri.joinPath(context.extensionUri, 'media')]
            } // Webview options. No local resource access.
          );
          panels.push(panel);
          const mazeState = new MazeState(panel, mazeViewCount, dimensions);
          (panel as any)._mazeState = mazeState;

          panel.webview.onDidReceiveMessage(message => {
            mazeState.onDidReceiveMessage(message);
          });
          getWebviewContent(context, panel);
          panel.onDidDispose(() => {
            const ix = panels.findIndex(p => p === panel);
            if (ix !== -1) {
              panels.splice(ix, 1);
            }
            mazeState.dispose();
          });
        })
        .catch(() => {
        });
    }),
    vscode.commands.registerCommand('maze.solve', (webviewPanel: vscode.WebviewPanel | null = null) => {
      if (webviewPanel === null || !webviewPanel.hasOwnProperty("_mazeState")) {
        for (let p of panels) {
          if (p.active) {
            webviewPanel = p;
          }
        }
      }
      const mazeState = (webviewPanel as any)?._mazeState;
      if (mazeState) {
        mazeState.solve();
      }
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