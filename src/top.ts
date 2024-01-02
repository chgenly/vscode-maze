import {CursorDirectionAndOpen, CursorAndOpen, Maze} from "./maze.js";
import {MazeDraw} from "./mazedraw.js";

let vscode = acquireVsCodeApi();

export function top(canvas: HTMLCanvasElement) {
    const map: StylePropertyMapReadOnly | undefined = canvas.parentElement?.computedStyleMap();
    if (map !== undefined) {
        const bg2 = map.get("background-color");
    }
    const maze = new Maze(15,15);
    const lineWidth = 4;
    const cellWidth = (canvas.width-lineWidth) / maze.width;
    const cellHeight = (canvas.height-lineWidth) / maze.height;
    const mazeDraw = new MazeDraw(canvas, cellWidth, cellHeight, lineWidth);
    for(const d of maze.clear()) {
        mazeDraw.drawWalls(d[0], d[1], d[2]);
    }
    drawWallSlowly(maze, mazeDraw, maze.generate(), () => {
        return drawCellSlowly(mazeDraw, maze.solve());
    });
}

/**
 * Draw the maze slowly so the user can watch.  A timer is used
 * to slow down the drawing, and also to allow the windowing
 * system to update the canvas after each move is made. If we
 * drew it in a loop, the windowing system would only draw
 * the final result, not step by step.
 */
function drawWallSlowly(maze: Maze, mazeDraw: MazeDraw, it: Generator<CursorDirectionAndOpen>, f: ()=>void): void {
    const res = it.next();
    if (!res.done)  {
        const v = res.value;
        mazeDraw.drawWalls(v[0], v[1], v[2]);
        vscode.postMessage({command: "status", used: maze.usedCells, total: maze.totalCells});
        setTimeout(() => drawWallSlowly(maze, mazeDraw, it, f), 1);
    } else {
        f();
    }
}


function drawCellSlowly(mazeDraw: MazeDraw, it: Generator<CursorAndOpen>): void {
    const res = it.next();
    if (!res.done)  {
        const v = res.value;
        mazeDraw.drawCell(v.cursor, v.open);
        setTimeout(() => drawCellSlowly(mazeDraw, it), v.open ? 100 : 100);
    }
}
