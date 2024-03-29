import * as vscode from "vscode";
import { Maze, Cursor, CursorDirectionAndOpen, Direction, CursorAndOpen, MazeDimesions, MazeState } from "./maze.js";

export class MazeDriver {
  private drawWallDelay = 100;
  private drawCellDelay = 100;
  private sbi: vscode.StatusBarItem | null;
  private readonly maze: Maze = new Maze(1, 1);
  private readonly webView: vscode.Webview;
  private finishGeneration: boolean = false;
  private startSolution: boolean = false;
  private finishSolution: boolean = false;

  constructor(private readonly panel: vscode.WebviewPanel, private readonly mazeViewId: number, dimensions: MazeDimesions) {
    this.maze = new Maze(dimensions.rows, dimensions.cols);
    this.webView = panel.webview;
    this.sbi = vscode.window.createStatusBarItem();
    this.sbi.command = {
      title: "Solve the maze",
      command: "maze.solve",
      arguments: [panel]
    } as vscode.Command;
    this.setFinishSolutionEnable(false);
    for (const d of this.maze.clear()) { }
    this.drawWallSlowly(this.maze.generate());
  }

  public dispose(): void {
    this.sbi?.dispose();
  }

  public solve(): void {
    if (!this.maze.isGenerationDone) {
      return;
    }
    this.setStartSolutionEnable(false);
    this.setFinishSolutionEnable(true);
    if (this.sbi !== null) {
      this.sbi.dispose();
      this.sbi = null;
    }
    this.drawCellSlowly(this.maze.solve());
  }

  private draw(): void {
    this.drawWalls();
    this.drawCells();
  }

  private drawWalls(): void {
    this.webView.postMessage({
      command: "drawWalls",
      walls: [...this.maze.allWalls()]
    });
  }

  private drawWall(cursorDirectionAndOpen: CursorDirectionAndOpen) {
    this.webView.postMessage({
      command: "drawWall",
      cursorDirectionAndOpen: cursorDirectionAndOpen,
    });
  }

  private drawWallSlowly(it: Generator<CursorDirectionAndOpen>): void {
    const res = it.next();
    if (this.finishGeneration) {
      this.webView.postMessage({
        command: "drawWalls",
        walls: [...it]
      });
    }
    if (!res.done) {
      const cursorDirectionAndOpen = res.value;
      this.drawWall(cursorDirectionAndOpen);
      this.updateStatusBarItem(this.maze.usedCells, this.maze.totalCells);
      setTimeout(() => this.drawWallSlowly(it), this.drawWallDelay);
    } else {
      if (this.sbi) {
        this.sbi.backgroundColor = new vscode.ThemeColor("statusBarItem.errorBackground");
      }
      this.setFinishGenerationEnable(false);
      if (this.startSolution) { this.solve(); }
    }
  }

  private drawCells(): void {
    this.webView.postMessage({
      command: "drawCells",
      cellsAndOpens: [...this.maze.allCells()]
    });
  }

  private drawCell(cursorAndOpen: CursorAndOpen): void {
    this.webView.postMessage({
      command: "drawCell",
      cursorAndOpen: cursorAndOpen
    });
  }

  private drawCellSlowly(it: Generator<CursorAndOpen>): void {
    const res = it.next();
    if (this.finishSolution) {
      this.webView.postMessage({
        command: "drawCells",
        cellsAndOpens: [...it]
      });
    }

    if (!res.done) {
      const cursorAndOpen = res.value;
      this.drawCell(cursorAndOpen);
      setTimeout(() => this.drawCellSlowly(it), this.drawCellDelay);
    } else {
      this.setFinishSolutionEnable(false);
    }
  }

  private updateStatusBarItem(used: number, total: number) {
    if (this.sbi) {
      this.sbi.text = "Maze " + this.mazeViewId + ":  " + used + "/" + total + " (used/total)";
      this.sbi.show();
    }
  }

  public onDidChangeActiveColorTheme(): void {
    this.webView.postMessage({command: "themeChanged"});
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
      case "finishGeneration":
        this.finishGeneration = true;
        this.setFinishGenerationEnable(false);
        break;
      case "startSolution":
        this.startSolution = true;
        this.setStartSolutionEnable(false);
        if (this.maze.state === MazeState.GENERATION_DONE) {
          this.solve();
        }
        break;
      case "finishSolution":
        this.finishSolution = true;
        this.setFinishSolutionEnable(false);
        if (this.maze.state === MazeState.GENERATION_DONE) {
          this.solve();
        }
        break;
      case "setLogSpeed":
        const logspeed = message.value;
        // delay 
        // 1000 -> 10
        // speed
        // .001 -> .1
        // logspeed
        // -3 -> -1
        const speed = 10 ** logspeed;
        const delay = 1 / speed;
        this.drawWallDelay = delay;
        this.drawCellDelay = delay;
        break;
    }
  }

  private setFinishGenerationEnable(enable: boolean) {
    this.webView.postMessage({ command: "setFinishGenerationEnable", enable: enable});
  }
  private setStartSolutionEnable(enable: boolean) {
    this.webView.postMessage({ command: "setStartSolutionEnable", enable: enable });
  }
  private setFinishSolutionEnable(enable: boolean) {
    this.webView.postMessage({ command: "setFinishSolutionEnable", enable: enable });
  }
}
