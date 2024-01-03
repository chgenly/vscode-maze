import {CursorDirectionAndOpen, Cursor, CursorAndOpen, Maze} from "./maze.js";
import {MazeDraw} from "./mazedraw.js";

let vscode = acquireVsCodeApi();

export function top(canvas: HTMLCanvasElement) {
    let mazeDraw: MazeDraw;
    vscode.postMessage({command: "getDimensions"});
    window.addEventListener('message', event =>{
        let data = event.data;
        switch (data.command) {
            case "dimensions":
                const lineWidth = 4;
                const cellWidth = (canvas.width-lineWidth) / data.width;
                const cellHeight = (canvas.height-lineWidth) / data.height;
                mazeDraw = new MazeDraw(canvas, cellWidth, cellHeight, lineWidth);
                vscode.postMessage({command: "getState"});
                break;
            case "drawWall":
                mazeDraw.drawWall(new Cursor(data.row, data.col), data.dir, data.open);
                break;
            case "drawCell":
                mazeDraw.drawCell(new Cursor(data.row, data.col), data.open);
                break;
        }
    });
    // const map: StylePropertyMapReadOnly | undefined = canvas.parentElement?.computedStyleMap();
    // if (map !== undefined) {
    //     const bg2 = map.get("background-color");
    // }
}

// /**
//  * Draw the maze slowly so the user can watch.  A timer is used
//  * to slow down the drawing, and also to allow the windowing
//  * system to update the canvas after each move is made. If we
//  * drew it in a loop, the windowing system would only draw
//  * the final result, not step by step.
//  */
// function drawWallSlowly(maze: Maze, mazeDraw: MazeDraw, it: Generator<CursorDirectionAndOpen>, f: ()=>void): void {
//     const res = it.next();
//     if (!res.done)  {
//         const v = res.value;
//         mazeDraw.drawWalls(v[0], v[1], v[2]);
//         vscode.postMessage({command: "status", used: maze.usedCells, total: maze.totalCells});
//         setTimeout(() => drawWallSlowly(maze, mazeDraw, it, f), 1);
//     } else {
//         f();
//     }
// }


// function drawCellSlowly(mazeDraw: MazeDraw, it: Generator<CursorAndOpen>): void {
//     const res = it.next();
//     if (!res.done)  {
//         const v = res.value;
//         mazeDraw.drawCell(v.cursor, v.open);
//         setTimeout(() => drawCellSlowly(mazeDraw, it), v.open ? 100 : 100);
//     }
// }
