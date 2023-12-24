import * as vscode from 'vscode';

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
          localResourceRoots: [],
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
      panel.webview.html = getWebviewContent();
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

function getWebviewContent(): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Maze</title>
</head>
<body>
  <h1>Maze</h1>
    <img src="https://media.giphy.com/media/JIX9t2j0ZTN9S/giphy.gif" width="300" />
    <script>
    // Handle the message inside the webview
        window.addEventListener('message', event => {

            const message = event.data; // The JSON data our extension sent
            const vscode = acquireVsCodeApi();
            vscode.postMessage({
              command: 'alert',
              text: message
            });
            switch (message.command) {
                case 'refactor':
                    count = Math.ceil(count * 0.5);
                    counter.textContent = count;
                    break;
            }
        });
    </script>
</body>
</html>`;
}