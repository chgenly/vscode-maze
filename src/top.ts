import {CursorDirectionAndOpen, Cursor, CursorAndOpen, Maze} from "./maze.js";
import {MazeDraw} from "./mazedraw.js";

let vscode = acquireVsCodeApi();

export function top(canvas: HTMLCanvasElement, slider: HTMLInputElement) {
    let mazeDraw: MazeDraw;

    slider.oninput = function() {
        const speed = parseInt(slider.value);
        vscode.postMessage({command: "setSpeed", value: speed});
    };
    slider.oninput(new Event(""));
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
                if (mazeDraw) {
                    mazeDraw.drawWall(new Cursor(data.row, data.col), data.dir, data.open);
                }
                break;
            case "drawCell":
                if (mazeDraw) {
                    mazeDraw.drawCell(new Cursor(data.row, data.col), data.open);
                }
                break;
        }
    });
}