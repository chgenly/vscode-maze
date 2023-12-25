export type Cursor = [number, number];
export enum Direction { up = "up", down = "down", left = "left", right = "right" };
function getAllDirections(): [Direction, Direction, Direction, Direction] {
    return [Direction.up, Direction.down, Direction.left, Direction.right];
}
function shuffle<T>(array: T[]): T[] {
    return array.sort(() => Math.random() - 0.5);
};
export interface MazeListener {
    draw(cursor: Cursor, dir: Direction, open: boolean): void;    
}
export class Maze {
    /**
     * Vertical walls [row][column].  True if a wall is present.
     * There are height+1 rows and width+1 columns. top most row is 0
     * bottom most row is height. Left most column is 0, right most column is width.
     */
    verticalWalls: boolean[][];
    /**
     * Horizontal walls [row][column].  True if a wall is present.
     * There are height+1 rows and width+1 columns. top most row is 0
     * bottom most row is height. Left most column is 0, right most column is width.
     */
    horizontalWalls: boolean[][];
    /**
     * Cells.  A cell is enclosed by four walls (present or not). There are height
     * rows, and width columns.
     */
    cells: boolean[][];

    usedCells: number = 0;

    listener: MazeListener | null = null;

    constructor(public width: number, public height: number) {
        this.clear();
        this.verticalWalls = [[]];
        this.horizontalWalls = [[]];
        this.cells = [[]];
    }

    public setDraw(listener: MazeListener): void {
        this.listener = listener;
    }

    public clear(): void {
        this.verticalWalls = [];
        this.horizontalWalls = [];
        console.log("maze constructor");
        this.cells = [];
        for (var row = 0; row <= this.height; ++row) {
            this.verticalWalls[row] = [];
            this.horizontalWalls[row] = [];
            for (var col = 0; col <= this.width; ++col) {
                if (row !== this.height) {
                    this.verticalWalls[row][col] = true;
                    if (this.listener !== null) {
                        this.listener.draw([row, col], Direction.left, false);
                    }
                }
                if (col !== this.width) {
                    this.horizontalWalls[row][col] = true;
                    if (this.listener !== null) {
                        this.listener.draw([row, col], Direction.up, false);
                    }
                }
            }
        }
        for (var row = 0; row < this.height; ++row) {
            this.cells[row] = [];
            for (var col = 0; col < this.width; ++col) {
                this.cells[row][col] = false;
            }
        }
    }

    public generate(): void {
        var row: number, col: number;

        row = 0;
        col = Math.floor(Math.random() * this.width);
        var cursor: Cursor = [row, col];
        this.openWallInDirection(cursor, Direction.up);

        const totalCells = this.width * this.height;
        while (this.usedCells < totalCells) {
            const dir = this.chooseDirectionToUnusedCell(cursor);
            if (dir === null) {
                this.advanceToUsed(cursor);
            } else {
                this.openWallInDirection(cursor, dir);
                this.moveCursorInDirection(cursor, dir);
            }
        }

        row = this.height;
        col = Math.floor(Math.random() * this.width);
        var cursor: Cursor = [row, col];
        this.openWallInDirection(cursor, Direction.up);
    }

    private moveCursorInDirection(cursor: Cursor, dir: Direction): void {
        switch (dir) {
            case Direction.up:
                --cursor[0];
                break;
            case Direction.down:
                ++cursor[0];
                break;
            case Direction.left:
                --cursor[1];
                break;
            case Direction.right:
                ++cursor[1];
                break;
        }
    }

    private advanceToUsed(cursor: Cursor): void {
        do {
            this.advanceOne(cursor);
        } while(this.isUnused(cursor));
    }

    private advanceOne(cursor: Cursor): void {
        ++cursor[1];
        if (cursor[1] >= this.width) {
            cursor[1] = 0;
            if (++cursor[0] >= this.height) {
                cursor[0] = 0;
            }
        }
    }

    private openWallInDirection(cursor: Cursor, dir: Direction): void {
        switch (dir) {
            case Direction.up:
                this.openWall(this.horizontalWalls, cursor);
                 break;
            case Direction.down:
                this.openWall(this.horizontalWalls, [cursor[0] + 1, cursor[1]]);
                break;
            case Direction.left:
                this.openWall(this.verticalWalls, cursor);
                break;
            case Direction.right:
                this.openWall(this.verticalWalls, [cursor[0], cursor[1]+1]);
                break;
        }
        if (this.listener !== null) {
            this.listener.draw(cursor, dir, true);
        }
    }

    private openWall(walls: boolean[][], [row, col]: Cursor): void {
        walls[row][col] = false;
        ++this.usedCells;
    }

    private chooseDirectionToUnusedCell(cursor: Cursor): Direction | null {
        var row: number = cursor[0];
        var col: number = cursor[1];
        const directions: Direction[] = shuffle(getAllDirections());
        for (var dir of directions) {
            if (this.isUnusedInDirection(cursor, dir)) { 
                return dir; 
            }
        }
        return null;
    }

    private isUnusedInDirection(cursor: Cursor, dir: Direction): boolean {
        switch (dir) {
            case Direction.up:
                return this.isUnused([cursor[0] - 1, cursor[1]]);
                break;
            case Direction.down:
                return this.isUnused([cursor[0] + 1, cursor[1]]);
                break;
            case Direction.left:
                return this.isUnused([cursor[0], cursor[1] - 1]);
                break;
            case Direction.right:
                return this.isUnused([cursor[0], cursor[1] + 1]);
                break;
        }
    }

    private isUsed(cursor: Cursor): boolean {
        return !this.isUnused(cursor);
    }

    private isUnused([row, col]: Cursor): boolean {
        if (row < 0 || row >= this.height) { return false; }
        if (col < 0 || col >= this.width) { return false; }
        return this.verticalWalls[row][col] && this.verticalWalls[row][col + 1] &&
            this.horizontalWalls[row][col] && this.horizontalWalls[row+1][col];
    }

    public print(): void {
        console.log("print");
        var s: string;
        for (var row = 0; row <= this.height; ++row) {
            s = "";
            for (var col = 0; col < this.width; ++col) {
                s += this.horizontalWalls[row][col] ? "+--" : "+  ";
            }
            s += "+";
            console.log(s);
            if (row !== this.height) {
                s = "";
                for (var col = 0; col <= this.width; ++col) {
                    s += this.verticalWalls[row][col] ? "|  " : "   ";
                }
                console.log(s);
            }
        }
    }
}

