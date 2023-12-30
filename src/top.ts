import {CursorDirectionAndOpen, Maze} from "./maze.js";
import {MazeDraw} from "./mazedraw.js";

let vscode = acquireVsCodeApi();

export function top(canvas: HTMLCanvasElement) {
    const map: StylePropertyMapReadOnly | undefined = canvas.parentElement?.computedStyleMap();
    if (map !== undefined) {
        const bg2 = map.get("background-color");
        console.log(`bg2=${bg2}`);
    }
    const maze = new Maze(30,30);
    const lineWidth = 4;
    const cellWidth = (canvas.width-lineWidth) / maze.width;
    const cellHeight = (canvas.height-lineWidth) / maze.height;
    const mazeDraw = new MazeDraw(canvas, cellWidth, cellHeight, lineWidth);
    for(const d of maze.clear()) {
        mazeDraw.draw(d[0], d[1], d[2]);
        vscode.postMessage({command: "status", used: maze.usedCells, total: maze.totalCells});
    }
    const it = maze.generate();
    drawSlowly(maze, mazeDraw, it);
}

/**
 * Draw the maze slowly so the user can watch.  A timer is used
 * to slow down the drawing, and also to allow the windowing
 * system to update the canvas after each move is made. If we
 * drew it in a loop, the windowing system would only draw
 * the final result, not step by step.
 */
function drawSlowly(maze: Maze, mazeDraw: MazeDraw, it: Generator<CursorDirectionAndOpen>): void {
    const res = it.next();
    if (!res.done)  {
        const v = res.value;
        console.log("drawing");
        mazeDraw.draw(v[0], v[1], v[2]);
        vscode.postMessage({command: "status", used: maze.usedCells, total: maze.totalCells});
        setTimeout(() => drawSlowly(maze, mazeDraw, it), 100);
    } else {
        console.log("drawing done");
    }
}

