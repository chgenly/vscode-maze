import {Maze, Direction, Cursor, CursorAndOpen, CursorDirectionAndOpen} from './maze.js';

export class MazeDraw {
    private ctx: CanvasRenderingContext2D;
    private backgroundColor = 'black';
    private wallColor = 'white';
    private cellWidth: number = 20;
    private cellHeight: number = 20;
    public constructor(private readonly canvas: HTMLCanvasElement, public readonly xCells: number, private yCells: number, cellWidth: number =  20, cellHeight: number = 20, private lineWidth = 4) {
        const ctx: CanvasRenderingContext2D | null = canvas.getContext('2d');
        if (ctx === null) { throw new Error("Can't get 2D context"); }
        this.ctx = ctx;
        this.setCellSize(cellWidth, cellHeight);
    }

    /**
     * Set the cell size. This will erase the canvas. Remember to redraw after calling this.
     */
    public setCellSize(cellWidth: number, cellHeight: number): void {
        this.cellWidth = cellWidth;
        this.cellHeight = cellHeight;
        this.canvas.width = cellWidth*this.xCells+this.lineWidth;
        this.canvas.height = cellHeight*this.yCells+this.lineWidth;
        this.ctx.fillStyle = this.backgroundColor;
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
    }

    public drawWalls(cursorDirectionAndOpens: CursorDirectionAndOpen[]) {
        for(const cdo of cursorDirectionAndOpens) {
            this.drawWall(cdo);
        }
    }

    public drawWall(cursorDirectionAndOpen: CursorDirectionAndOpen): void {
        const {cursor, dir, open} = cursorDirectionAndOpen;
        var x1, y1, w, h;
        const delta = open ? this.lineWidth : 0;
        switch(dir) {
            case Direction.up:
                x1 = cursor.col*this.cellWidth + delta;
                y1 = cursor.row*this.cellHeight - delta;
                w = this.cellWidth + this.lineWidth - 2*delta;
                h = this.lineWidth+2*delta;
                break;
            case Direction.down:
                x1 = cursor.col*this.cellWidth + delta;
                y1 = (cursor.row+1)*this.cellHeight - delta;
                w = this.cellWidth + this.lineWidth - 2*delta;
                h = this.lineWidth+2*delta;
                break;
            case Direction.left:
                x1 = cursor.col*this.cellWidth-delta;
                y1 = cursor.row*this.cellHeight + delta;
                w = this.lineWidth+2*delta;
                h = this.cellHeight + this.lineWidth - 2*delta;
                break;
            case Direction.right:
                x1 = (cursor.col+1)*this.cellWidth - delta;
                y1 = cursor.row*this.cellHeight + delta;
                w = this.lineWidth+2*delta;
                h = this.cellHeight + this.lineWidth - 2*delta;
                break;
        }
        this.ctx.fillStyle = open ? this.backgroundColor : this.wallColor;
        this.ctx.fillRect(x1, y1, w, h);
    }

    public drawCells(cursorsAndOpens: CursorAndOpen[]): void {
        for(const co of cursorsAndOpens) {
            this.drawCell(co);
        }
    }

    public drawCell(cursorAndOpen: CursorAndOpen): void {
        const {cursor, open} = cursorAndOpen;
        const insetStart = this.lineWidth + (open ? 0 : 2*this.lineWidth);
        const insetEnd = this.lineWidth + (open ? 0 : 4*this.lineWidth); 

        if (open) {
            this.ctx.fillStyle = this.backgroundColor;
            let y = cursor.row * this.cellHeight + insetStart;
            let x = cursor.col * this.cellWidth + insetStart;
            this.ctx.fillRect(x, y, this.cellWidth-insetEnd, this.cellHeight-insetEnd);
        } else {
            console.log(`cursor=${JSON.stringify(cursor)} ch=${this.cellHeight} insetStart=${insetStart} insetEnd=${insetEnd}`);
            let y1 = cursor.row * this.cellHeight + insetStart;
            let x1 = cursor.col * this.cellWidth + insetStart;
            let y2 = y1 + this.cellHeight - insetEnd;
            let x2 = x1 + this.cellWidth - insetEnd;
            console.log(`x1=${x1} y1=${y1} x2=${x2} y2=${y2}`);
            let xc = (x1+x2)/2;
            let yc = (y1+y2)/2;
            this.ctx.strokeStyle = this.wallColor;
            this.ctx.beginPath();
            this.ctx.moveTo(x1, y1);
            this.ctx.lineTo(x2, y2);
            this.ctx.stroke();
            this.ctx.moveTo(x1, y2);
            this.ctx.lineTo(x2, y1);
            this.ctx.stroke();
            this.ctx.moveTo(x1, yc);
            this.ctx.lineTo(x2, yc);
            this.ctx.stroke();
            this.ctx.moveTo(xc, y1);
            this.ctx.lineTo(xc, y2);
            this.ctx.stroke();
        }
    }
}