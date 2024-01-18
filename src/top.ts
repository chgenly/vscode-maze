import { CursorDirectionAndOpen, Cursor, CursorAndOpen, Maze } from "./maze.js";
import { MazeDraw } from "./mazedraw.js";

let vscode = acquireVsCodeApi();

export function top(canvas: HTMLCanvasElement, speedSlider: HTMLInputElement, sizeSlider: HTMLInputElement, finishGenerationButton: HTMLInputElement,
    startSolutionButton: HTMLInputElement,
    finishSolutionButton: HTMLInputElement): void {

    let mazeDraw: MazeDraw;

    speedSlider.oninput = function () {
        const speed = parseInt(speedSlider.value);
        vscode.postMessage({ command: "setLogSpeed", value: speed });
    };
    sizeSlider.oninput = function () {
        const size = parseInt(sizeSlider.value);
        mazeDraw.setCellSize(size, size);
        vscode.postMessage({ command: "getState"});
    };
    speedSlider.oninput(new Event(""));
    finishGenerationButton.onclick = () => vscode.postMessage({ command: "finishGeneration" });
    startSolutionButton.onclick = () => vscode.postMessage({ command: "startSolution" });
    finishSolutionButton.onclick = () => vscode.postMessage({ command: "finishSolution" });
    vscode.postMessage({ command: "getDimensions" });
    window.addEventListener('message', event => {
        let message = event.data;
        console.log(JSON.stringify(message));
        switch (message.command) {
            case "dimensions":
                const lineWidth = 4;
                const xCells = message.width;
                const yCells = message.height;
                const cellWidth = 20;
                const cellHeight = 20;
                mazeDraw = new MazeDraw(canvas, xCells, yCells, cellWidth, cellHeight, lineWidth);
                // This will cause all walls and cells to be drawn.
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
            case "setFinishGenerationEnable":
                finishGenerationButton.disabled = !message.enable;
                break;
            case "setStartSolutionEnable":
                startSolutionButton.disabled = !message.enable;
                break;
            case "setFinishSolutionEnable":
                finishSolutionButton.disabled = !message.enable;
                break;
        }
    });
}