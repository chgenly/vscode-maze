import { CONNREFUSED } from "dns";
import { CursorDirectionAndOpen, Cursor, CursorAndOpen, Maze } from "./maze.js";
import { MazeDraw } from "./mazedraw.js";
import { Rectangle } from "./rectangle.js";

let vscode = acquireVsCodeApi();

export function top(canvasContainer: HTMLDivElement, canvas: HTMLCanvasElement, speedSlider: HTMLInputElement, sizeSlider: HTMLInputElement,
    finishGenerationButton: HTMLInputElement,
    startSolutionButton: HTMLInputElement,
    finishSolutionButton: HTMLInputElement,
    sizeLegend: HTMLLegendElement): void {

    let mazeDraw: MazeDraw;
    let cellSize = 0;

    speedSlider.oninput = function () {
        const speed = parseInt(speedSlider.value);
        vscode.postMessage({ command: "setLogSpeed", value: speed });
    };
    sizeSlider.oninput = function () {
        cellSize = parseInt(sizeSlider.value);
        sizeLegend.textContent = "Cell Size: " + cellSize;
        if (mazeDraw) {
            mazeDraw.setCellSize(cellSize, cellSize);
            vscode.postMessage({ command: "getState" });
        }
    };
    sizeSlider.oninput(new Event(""));
    speedSlider.oninput(new Event(""));
    finishGenerationButton.onclick = () => vscode.postMessage({ command: "finishGeneration" });
    startSolutionButton.onclick = () => vscode.postMessage({ command: "startSolution" });
    finishSolutionButton.onclick = () => vscode.postMessage({ command: "finishSolution" });
    vscode.postMessage({ command: "getDimensions" });
    window.addEventListener('message', event => {
        let message = event.data;
        switch (message.command) {
            case "dimensions":
                const lineWidth = 4;
                const xCells = message.width;
                const yCells = message.height;
                mazeDraw = new MazeDraw(canvas, xCells, yCells, cellSize, cellSize, lineWidth,
                    focusOnMazeRectangle);
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
            case "themeChanged":
                mazeDraw.getBodyColors();
                vscode.postMessage({ command: "getState" });
                break;
        }
    });
    function focusOnMazeRectangle(cell: Rectangle) {
        let viewport = Rectangle.xywh(canvasContainer.scrollLeft, canvasContainer.scrollTop,
            canvasContainer.clientWidth, canvasContainer.clientHeight);
        if (viewport.isBelowTop(cell)) {
            viewport = viewport.alignTopWith(cell.y1);
        }
        if (viewport.isAboveBottom(cell)) {
            viewport = viewport.alignBottomWith(cell.y2);
        }
        if (viewport.isRightOfLeft(cell)) {
            viewport = viewport.alignLeftWith(cell.x1);
        }
        if (viewport.isLeftOfRight(cell)) {
            viewport = viewport.alignRightWith(cell.x2);
        }
        canvasContainer.scrollTop = viewport.y1;
        canvasContainer.scrollLeft = viewport.x1;
    }
}