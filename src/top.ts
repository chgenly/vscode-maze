import {Maze} from "./maze.js";
import {MazeDraw} from "./mazedraw.js";

export function top(canvas: HTMLCanvasElement) {
    const mazeDraw = new MazeDraw(canvas);
    const maze = new Maze(10,10);
    maze.setDraw(mazeDraw);
    maze.clear();
    maze.generate();
    maze.print();
}