import * as vscode from 'vscode';
import * as path from 'path';
import * as fs from 'fs';

export function activate(context: vscode.ExtensionContext) {
  var panel: vscode.WebviewPanel | undefined;
  context.subscriptions.push(
    
    vscode.commands.registerCommand('maze.generate', () => {
      // Create and show a new webview
      panel = vscode.window.createWebviewPanel(
        'maze', // Identifies the type of the webview. Used internally
        'Maze by Genly', // Title of the panel displayed to the user
        vscode.ViewColumn.One, // Editor column to show the new webview panel in.
        {
          // localResourceRoots: [],
          enableScripts: true,
          //localResourceRoots: [vscode.Uri.joinPath(context.extensionUri, 'media')]
        } // Webview options. No local resource access.
      );

      panel.onDidChangeViewState(e => {
        //redraw
        e = e;
      });
      panel.webview.onDidReceiveMessage(message => {
        switch(message.command) {
          case "alert":
            vscode.window.showInformationMessage("Webview alert: ".concat(JSON.stringify(message)));  
            break;
        }
      });
      getWebviewContent(context, panel);
      panel.onDidDispose(() => panel = undefined);
      vscode.window.showInformationMessage("Hello, this is the maze maker!");
    }),

    vscode.commands.registerCommand('maze.solve', () => {
      // Create and show a new webview
      if (!panel) {
        vscode.window.showInformationMessage("Generate a maze first.");
      } else {
        panel.webview.postMessage({command: "solve"});
        vscode.window.showInformationMessage("All solved!");
      }
    }),
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