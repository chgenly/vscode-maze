import { CursorDirectionAndOpen, Cursor, CursorAndOpen, Maze } from "./maze.js";
import { MazeDraw } from "./mazedraw.js";

let vscode = acquireVsCodeApi();

export function top(canvas: HTMLCanvasElement, slider: HTMLInputElement) {
    let mazeDraw: MazeDraw;

    slider.oninput = function () {
        const speed = parseInt(slider.value);
        vscode.postMessage({ command: "setSpeed", value: speed });
    };
    slider.oninput(new Event(""));
    vscode.postMessage({ command: "getDimensions" });
    window.addEventListener('message', event => {
        let message = event.data;
        switch (message.command) {
            case "dimensions":
                const lineWidth = 4;
                const cellWidth = (canvas.width - lineWidth) / message.width;
                const cellHeight = (canvas.height - lineWidth) / message.height;
                mazeDraw = new MazeDraw(canvas, cellWidth, cellHeight, lineWidth);
                vscode.postMessage({ command: "getState" });
                break;
            case "drawWall":
                if (mazeDraw) {
                    mazeDraw.drawWall(message.cursorDirectionAndOpen);
                }
                break;
            case "drawWalls":
                if (mazeDraw) {
                    mazeDraw.drawWalls(message.walls);
                }
                break;
            case "drawCell":
                if (mazeDraw) {
                    mazeDraw.drawCell(message.cursorAndOpen);
                }
                break;
            case "drawCells":
                if (mazeDraw) {
                    mazeDraw.drawCells(message.cellsAndOpens);
                }
                break;
        }
    });
}