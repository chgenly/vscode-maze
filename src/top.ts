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
}