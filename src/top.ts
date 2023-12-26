import {CursorDirectionAndOpen, Maze} from "./maze.js";
import {MazeDraw} from "./mazedraw.js";

export function top(canvas: HTMLCanvasElement) {
    const maze = new Maze(10,10);
    const mazeDraw = new MazeDraw(canvas);
    for(const d of maze.clear()) {
        mazeDraw.draw(d[0], d[1], d[2]);
    }
    const it = maze.generate();
    drawSlowly(mazeDraw, it);
}

/**
 * Draw the maze slowly so the user can watch.  A timer is used
 * to slow down the drawing, and also to allow the windowing
 * system to update the canvas after each move is made. If we
 * drew it in a loop, the windowing system would only draw
 * the final result, not step by step.
 */
function drawSlowly(mazeDraw: MazeDraw, it: Generator<CursorDirectionAndOpen>): void {
    const res = it.next();
    if (!res.done)  {
        const v = res.value;
        console.log("drawing");
        mazeDraw.draw(v[0], v[1], v[2]);
        setTimeout(() => drawSlowly(mazeDraw, it), 100);
    } else {
        console.log("drawing done");
    }
}