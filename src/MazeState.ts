import * as vscode from "vscode";
import { Maze, CursorDirectionAndOpen, Direction, CursorAndOpen, MazeDimesions } from "./maze.js";

export class MazeState {
  private drawWallDelay = 0;
  private drawCellDelay = 100;
  private sbi: vscode.StatusBarItem | null;
  private readonly maze: Maze = new Maze(5, 5);
  private readonly webView: vscode.Webview;

  constructor(private readonly panel: vscode.WebviewPanel, private readonly mazeViewId: number, dimensions: MazeDimesions) {
    this.maze = new Maze(dimensions.rows, dimensions.cols);
    this.webView = panel.webview;
    this.sbi = vscode.window.createStatusBarItem();
    this.sbi.command = {
      title: "Solve the maze",
      command: "maze.solve",
      arguments: [panel]
    } as vscode.Command;
    for (const d of this.maze.clear()) { }
    this.drawWallSlowly(this.maze.generate());
  }
  
  drawWallSlowly(it: Generator<CursorDirectionAndOpen>): void {
    const res = it.next();
    if (!res.done) {
      const v = res.value;
      const cursor = v[0];
      const dir = v[1];
      const open = v[2];
      this.drawWall(cursor.row, cursor.col, dir, open);
      this.updateStatusBarItem(this.maze.usedCells, this.maze.totalCells);
      setTimeout(() => this.drawWallSlowly(it), this.drawWallDelay);
    } else {
      if (this.sbi) {
        this.sbi.backgroundColor = new vscode.ThemeColor("statusBarItem.errorBackground");
      }
    }
  }

  dispose(): void {
    this.sbi?.dispose();
  }

  solve(): void {
    if (!this.maze.isGenerationDone) {
      return;
    }
    if (this.sbi !== null) {
      this.sbi.dispose();
      this.sbi = null;
    }
    this.drawCellSlowly(this.maze.solve());
  }

  drawCellSlowly(it: Generator<CursorAndOpen>): void {
    const res = it.next();
    if (!res.done) {
      const v = res.value;
      const cursor = v.cursor;
      this.drawCell(cursor.row, cursor.col, v.open);
      setTimeout(() => this.drawCellSlowly(it), this.drawCellDelay);
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
      this.drawWall(cursor.row, cursor.col, dir, open);
    }
  }

  drawWall(row: number, col: number, dir: Direction, open: boolean) {
    this.webView.postMessage({
      command: "drawWall",
      row: row,
      col: col,
      dir: dir,
      open: open
    });
  }

  drawCells(): void {
    for (let cursorAndOpen of this.maze.allCells()) {
      const cursor = cursorAndOpen.cursor;
      const open = cursorAndOpen.open;
      this.drawCell(cursor.row, cursor.col, open);
    }
  }

  drawCell(row: number, col: number, open: boolean): void {
      this.webView.postMessage({
        command: "drawCell",
        row: row,
        col: col,
        open: open
      });
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
      case "setSpeed":
        const speed = message.value;
        this.drawWallDelay = 100-speed;
        this.drawCellDelay = 100-speed;
        break;
    }
  }
}
