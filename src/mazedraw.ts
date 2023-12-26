import {Maze, Direction, Cursor, CursorDirectionAndOpen} from './maze.js';

export class MazeDraw {
    private ctx: CanvasRenderingContext2D;
    private width: number;
    private height: number;
    private backgroundColor = 'black';
    private wallColor = 'white';

    public constructor(canvas: HTMLCanvasElement, private cellWidth: number =  20, private cellHeight: number = 20, private lineWidth = 4) {
        console.log(`canvas=${canvas}`);
        const ctx: CanvasRenderingContext2D | null = canvas.getContext('2d');
        if (ctx === null) { throw new Error("Can't get 2D context"); }
        this.ctx = ctx;
        this.width = canvas.width;
        this.height = canvas.height;
        this.ctx.fillStyle = this.backgroundColor;
        this.ctx.fillRect(0, 0, canvas.width, canvas.height);
      }

    public draw(cursor: Cursor, dir: Direction, open: boolean): void {
        var x1, y1, w, h;
        const delta = open ? this.lineWidth : 0;
        switch(dir) {
            case Direction.up:
                x1 = cursor[1]*this.cellWidth + delta;
                y1 = cursor[0]*this.cellHeight - delta;
                w = this.cellWidth + this.lineWidth - 2*delta;
                h = this.lineWidth+2*delta;
                break;
            case Direction.down:
                x1 = cursor[1]*this.cellWidth + delta;
                y1 = (cursor[0]+1)*this.cellHeight - delta;
                w = this.cellWidth + this.lineWidth - 2*delta;
                h = this.lineWidth+2*delta;
                break;
            case Direction.left:
                x1 = cursor[1]*this.cellWidth-delta;
                y1 = cursor[0]*this.cellHeight + delta;
                w = this.lineWidth+2*delta;
                h = this.cellHeight + this.lineWidth - 2*delta;
                break;
            case Direction.right:
                x1 = (cursor[1]+1)*this.cellWidth - delta;
                y1 = cursor[0]*this.cellHeight + delta;
                w = this.lineWidth+2*delta;
                h = this.cellHeight + this.lineWidth - 2*delta;
                break;
        }
        this.ctx.fillStyle = open ? this.backgroundColor : this.wallColor;
        this.ctx.fillRect(x1, y1, w, h);
    }
}