import { Maze, Direction, Cursor, CursorAndOpen, CursorDirectionAndOpen } from './maze.js';

export class MazeDraw {
    private ctx: CanvasRenderingContext2D;
    private backgroundColor = 'black';
    private wallColor = 'white';
    private cellColor = '#2554C7';
    private cellWidth: number = 20;
    private cellHeight: number = 20;
    private tooSmall: boolean = false;
    private lineWidth: number = 4;

    public constructor(private readonly canvas: HTMLCanvasElement,
        private readonly xCells: number,  private yCells: number,
        cellWidth: number = 20, cellHeight: number = 20,
        private desiredLineWidth = 4) {

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
        if (this.isTooSmall(this.desiredLineWidth)) {
            this.lineWidth = 1;
            this.tooSmall = true;
        } else {
            this.lineWidth = this.desiredLineWidth;
            this.tooSmall = false;
        }
        this.canvas.width = cellWidth * this.xCells + this.lineWidth;
        this.canvas.height = cellHeight * this.yCells + this.lineWidth;
        this.ctx.fillStyle = this.backgroundColor;
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
    }

    public drawWalls(cursorDirectionAndOpens: CursorDirectionAndOpen[]) {
        for (const cdo of cursorDirectionAndOpens) {
            this.drawWall(cdo);
        }
    }


    /** Draw a wall.  Here is a text drawing of a horizontal with an opening.
     * Line width is assumed to be 4.
     *
     * ----            ----
     * ----            ----
     * ----            ----
     * ----            ----
     * ||||            ||||  <-- Part of vertical wall
     *
     * |< cell width ->|
     * |<>| line width
     *      line width |<>|
     * 
     * Notice the cell width encompasses the left part of the wall, but not the right 
    */
    public drawWall(cursorDirectionAndOpen: CursorDirectionAndOpen): void {
        const { cursor, dir, open } = cursorDirectionAndOpen;
        var x1, y1, w, h;
        const delta = open ? this.lineWidth : 0;
        switch (dir) {
            case Direction.up:
                x1 = cursor.col * this.cellWidth + delta;
                y1 = cursor.row * this.cellHeight - delta;
                w = this.cellWidth + this.lineWidth - 2 * delta;
                h = this.lineWidth + 2 * delta; // Taller than otherwise needed to account for anti-aliasing artifacts.
                break;
            case Direction.down:
                x1 = cursor.col * this.cellWidth + delta;
                y1 = (cursor.row + 1) * this.cellHeight - delta;
                w = this.cellWidth + this.lineWidth - 2 * delta;
                h = this.lineWidth + 2 * delta;
                break;
            case Direction.left:
                x1 = cursor.col * this.cellWidth - delta;
                y1 = cursor.row * this.cellHeight + delta;
                w = this.lineWidth + 2 * delta;
                h = this.cellHeight + this.lineWidth - 2 * delta;
                break;
            case Direction.right:
                x1 = (cursor.col + 1) * this.cellWidth - delta;
                y1 = cursor.row * this.cellHeight + delta;
                w = this.lineWidth + 2 * delta;
                h = this.cellHeight + this.lineWidth - 2 * delta;
                break;
        }
        this.ctx.fillStyle = open ? this.backgroundColor : this.wallColor;
        this.ctx.fillRect(x1, y1, w, h);
    }

    public drawCells(cursorsAndOpens: CursorAndOpen[]): void {
        for (const co of cursorsAndOpens) {
            this.drawCell(co);
        }
    }

    public drawCell(cursorAndOpen: CursorAndOpen): void {
        const { cursor, open } = cursorAndOpen;

        if (open) {
            this.ctx.fillStyle = this.backgroundColor;
            let y = cursor.row * this.cellHeight + this.lineWidth;
            let x = cursor.col * this.cellWidth + this.lineWidth;
            this.ctx.fillRect(x, y, this.cellWidth - this.lineWidth, this.cellHeight - this.lineWidth);
        } else {
            if (this.tooSmall) {
                this.drawBox(cursor);
            } else {
                this.drawAsterisk(cursor);
            }
        }
    }

    private readonly smallestAsteriskSize = 3;

    private isTooSmall(lineWidth: number): boolean {
        const interiorWidth = this.cellWidth - 2*lineWidth; // Remove left and right walls.
        const interiorHeight = this.cellHeight - 2*lineWidth;
        const asteriskWidth = interiorWidth - 2*this.asteriskMargin(lineWidth);
        const asteriskheight = interiorHeight - 2*this.asteriskMargin(lineWidth);
        return asteriskWidth < this.smallestAsteriskSize || asteriskheight < this.smallestAsteriskSize;
    }

    /**
     * @returns Margin required by asterisk on the interior of a cell.
     */
    private asteriskMargin(lineWidth:  number): number {
        return 2 * lineWidth;
    }

    private drawBox(cursor: Cursor): void {
        const margin = 0;
        this.ctx.fillStyle = this.cellColor;
        const cellX = cursor.col * this.cellWidth;
        const cellY = cursor.row * this.cellHeight;
        let x1 = cellX + this.lineWidth + margin;
        let y1 = cellY + this.lineWidth + margin;
        let x2 = cellX + this.cellWidth - margin;
        let y2 = cellY + this.cellHeight - margin;
        this.ctx.fillRect(x1, y1, x2-x1, y2-y1);
    }

    private drawAsterisk(cursor: Cursor): void {
        const cellX = cursor.col * this.cellWidth;
        const cellY = cursor.row * this.cellHeight;
        let y1 = cellY + this.lineWidth + this.asteriskMargin(this.lineWidth);
        let x1 = cellX + this.lineWidth + this.asteriskMargin(this.lineWidth);
        let x2 = cellX + this.cellWidth - this.asteriskMargin(this.lineWidth);
        let y2 = cellY + this.cellHeight - this.asteriskMargin(this.lineWidth);
        let xc = (x1 + x2) / 2;
        let yc = (y1 + y2) / 2;
        this.ctx.strokeStyle = this.cellColor;
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