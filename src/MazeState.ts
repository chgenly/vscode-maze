import * as vscode from "vscode";
import { Maze } from "./maze.js";

export class MazeState {
  sbi: vscode.StatusBarItem | null;
  maze: Maze = new Maze(5, 3);
  constructor(private readonly webView: vscode.Webview, private readonly mazeViewId: number) {
    this.sbi = vscode.window.createStatusBarItem();
    this.sbi.command = {
      title: "Solve the maze",
      command: "maze.solve",
      arguments: [this]
    } as vscode.Command;
    for (const d of this.maze.clear()) { }
    for (const d of this.maze.generate()) {
      this.updateStatusBarItem(this.maze.usedCells, this.maze.totalCells);
    }
  }
  dispose(): void {
    this.sbi?.dispose();
  }
  solve(): void {
    console.log("solving");
    for (const x of this.maze.solve()) { }
    this.drawCells();
    if (this.sbi !== null) {
      this.sbi.dispose();
      this.sbi = null;
    }
  }
  draw(): void {
    this.drawWalls();
    this.drawCells();
  }
  drawWalls(): void {
    for (let cursorDirectionAndOpen of this.maze.allWalls()) {
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
    for (let cursorAndOpen of this.maze.allCells()) {
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
  updateStatusBarItem(used: number, total: number) {
    if (this.sbi) {
      this.sbi.text = "Maze " + this.mazeViewId + ":  " + used + "/" + total + " (used/total)";
      this.sbi.show();
    }
  }
  onDidReceiveMessage(message: any): void {
    switch (message.command) {
      case "alert":
        vscode.window.showInformationMessage("Webview alert: ".concat(JSON.stringify(message)));
        break;
      case "status":
        this.updateStatusBarItem(message.used, message.total);
        break;
      case "getDimensions":
        this.webView.postMessage({ command: "dimensions", width: this.maze.width, height: this.maze.height });
        break;
      case "getState":
        this.draw();
        break;
    }
  }
}
