import {Maze, Direction, Cursor, CursorDirectionAndOpen} from './maze.js';

export class MazeDraw {
    private ctx: CanvasRenderingContext2D;
    private width: number;
    private height: number;
    private backgroundColor = 'black';
    private wallColor = 'white';

    public constructor(canvas: HTMLCanvasElement, private cellWidth: number =  20, private cellHeight: number = 20, private lineWidth = 4) {
        const ctx: CanvasRenderingContext2D | null = canvas.getContext('2d');
        if (ctx === null) { throw new Error("Can't get 2D context"); }
        this.ctx = ctx;
        this.width = canvas.width;
        this.height = canvas.height;
        this.ctx.fillStyle = this.backgroundColor;
        this.ctx.fillRect(0, 0, canvas.width, canvas.height);
    }

    public drawWall(cursor: Cursor, dir: Direction, open: boolean): void {
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

    public drawCell(cursor: Cursor, open: boolean) {
        const insetStart = this.lineWidth + (open ? 0 : 2*this.lineWidth);
        const insetEnd = this.lineWidth + (open ? 0 : 4*this.lineWidth); 
        if (open) {
            this.ctx.fillStyle = this.backgroundColor;
            let y = cursor.row * this.cellHeight + insetStart;
            let x = cursor.col * this.cellWidth + insetStart;
            this.ctx.fillRect(x, y, this.cellWidth-insetEnd, this.cellHeight-insetEnd);
        } else {
            let y1 = cursor.row * this.cellHeight + insetStart;
            let x1 = cursor.col * this.cellWidth + insetStart;
            let y2 = y1 + this.cellHeight - insetEnd;
            let x2 = x1 + this.cellWidth - insetEnd;
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