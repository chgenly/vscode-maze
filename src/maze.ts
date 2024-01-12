export enum MazeState {GENERATION_NOT_STARTED, GENERATION_IN_PROGRESS, GENERATION_DONE, SOLUTION_IN_PROGRESS, SOLUTION_DONE};

class ChoicePoint {
    constructor(public readonly cursors: Cursor[], public readonly index: number) {
    }
}
export type MazeDimesions = {rows: number, cols: number};
export class Cursor {
    constructor(public readonly row: number, public readonly col: number) {}

    move(dir: Direction): Cursor {
        switch (dir) {
            case Direction.up:
                return new Cursor(this.row - 1, this.col);
            case Direction.down:
                return new Cursor(this.row + 1, this.col);
            case Direction.left:
                return new Cursor(this.row, this.col-1);
            case Direction.right:
                return new Cursor(this.row, this.col+1);
        }
    }
}
export class CursorDirectionAndOpen {
    constructor(public readonly cursor: Cursor, public readonly dir: Direction, public readonly open: boolean) {

    }
};
type CursorDirectionAndIndex = [Cursor, Direction, number];
export class CursorAndOpen {
    constructor(public readonly cursor: Cursor, public readonly open: boolean) {}
}
class CursorAndDirection {
    constructor(public readonly cursor: Cursor, public readonly direction: Direction) {}
}
export enum Direction { up = "up", down = "down", left = "left", right = "right" };
export function getAllDirections(): [Direction, Direction, Direction, Direction] {
    return [Direction.up, Direction.down, Direction.left, Direction.right];
}
function shuffle<T>(array: T[]): T[] {
    return array.sort(() => Math.random() - 0.5);
};
export class Maze {
    /**
     * Vertical walls [row][column].  True if a wall is present.
     * There are height+1 rows and width+1 columns. top most row is 0
     * bottom most row is height. Left most column is 0, right most column is width.
     */
    protected verticalWalls: boolean[][];
    /**
     * Horizontal walls [row][column].  True if a wall is present.
     * There are height+1 rows and width+1 columns. top most row is 0
     * bottom most row is height. Left most column is 0, right most column is width.
     */
    protected horizontalWalls: boolean[][];
    /**
     * Cells.  A cell is enclosed by four walls (present or not). There are height
     * rows, and width columns.
     */
    protected cells: boolean[][];

    protected _usedCells: number = 0;

    public get usedCells() {return this._usedCells;}

    readonly totalCells: number;

    protected _state: MazeState = MazeState.GENERATION_NOT_STARTED;;

    public get state(): MazeState {
        return this._state;
    }

    public get isGenerationDone() {
        return this._state >= MazeState.GENERATION_DONE;
    }

    public get isSolutionInProgress() {
        return this._state === MazeState.SOLUTION_IN_PROGRESS;
    }

    constructor(public width: number, public height: number) {
        this.verticalWalls = [[]];
        this.horizontalWalls = [[]];
        this.cells = [[]];
        this.totalCells = width*height;
        for(const unused of this.clear()) {}
    }

    public* clear(): Generator<CursorDirectionAndOpen> {
        this._state = MazeState.GENERATION_NOT_STARTED;
        this.verticalWalls = [];
        this.horizontalWalls = [];
        this.cells = [];
        for (var row = 0; row <= this.height; ++row) {
            this.verticalWalls[row] = [];
            this.horizontalWalls[row] = [];
            for (var col = 0; col <= this.width; ++col) {
                if (row !== this.height) {
                    this.verticalWalls[row][col] = true;
                    yield new CursorDirectionAndOpen(new Cursor(row, col), Direction.left, false);
                }
                if (col !== this.width) {
                    this.horizontalWalls[row][col] = true;
                    yield new CursorDirectionAndOpen(new Cursor(row, col), Direction.up, false);
                }
            }
        }
        for (var row = 0; row < this.height; ++row) {
            this.cells[row] = [];
            for (var col = 0; col < this.width; ++col) {
                this.markCellUnused(new Cursor(row, col));
            }
        }
    }
    public* allWalls(): Generator<CursorDirectionAndOpen> {
        for(let row=0; row<=this.height; ++row) {
            for(let col=0; col<this.width; ++col) {
                yield new CursorDirectionAndOpen(new Cursor(row, col), Direction.up, !this.horizontalWalls[row][col]);
            }
            for(let col=0; col<=this.width; ++col) {
                yield new CursorDirectionAndOpen(new Cursor(row, col), Direction.left, !this.verticalWalls[row][col]);
            }
        }
    }

    public* allCells(): Generator<CursorAndOpen> {
        for(let row=0; row<this.height; ++row) {
            for(let col=0; col<this.width; ++col) {
                yield new CursorAndOpen(new Cursor(row, col), !this.cells[row][col]);
            }
        }
    }

    public* generate(): Generator<CursorDirectionAndOpen> {
        var row: number, col: number;

        this._state = MazeState.GENERATION_IN_PROGRESS;

        row = 0;
        col = Math.floor(Math.random() * this.width);
        var cursor: Cursor = new Cursor(row, col);
        this.openWallInDirection(cursor, Direction.up);
        yield new CursorDirectionAndOpen(cursor, Direction.up, true);

        const totalCells = this.width * this.height;
        while (this._usedCells < totalCells) {
            const dir = this.chooseDirectionToUnusedCell(cursor);
            if (dir === null) {
                cursor = this.advanceToUsed(cursor);
            } else {
                this.openWallInDirection(cursor, dir);
                yield new CursorDirectionAndOpen(cursor, dir, true);
                cursor = cursor.move(dir);
            }
        }

        row = this.height;
        col = Math.floor(Math.random() * this.width);
        var cursor: Cursor = new Cursor(row, col);
        this.openWallInDirection(cursor, Direction.up);
        yield new CursorDirectionAndOpen(cursor, Direction.up, true);
        this._state = MazeState.GENERATION_DONE;
    }

    public* solve(): Generator<CursorAndOpen> {
        if (this._state !== MazeState.GENERATION_DONE) {
            return;
        }
        this._state = MazeState.SOLUTION_IN_PROGRESS;
        let choicePoints: ChoicePoint[] = [];
        let history: Cursor[] = [];

        let cursor = this.findStartOfMaze();
        yield new CursorAndOpen(cursor, false);
        history.push(cursor);
        this.markCellUsed(cursor);

        while(!this.atExit(cursor)) {
            let moves: Cursor[] = this.findNextSolutionMoves(cursor);
            if (moves.length === 0) {
                if (choicePoints.length === 0) {
                    return;
                }
                let cp = choicePoints[choicePoints.length-1];
                let cu: Cursor | undefined = cp.cursors.shift();
                if (cu === undefined) {
                    return;
                }
                if (cp.cursors.length === 0) {
                    choicePoints.pop();
                }
                let from = history.length;
                let to = cp.index;
                for(let i=from; i>to; --i) {
                    let c = history.pop();
                    if (c === undefined) {
                        return;
                    }
                    yield new CursorAndOpen(c, true);
                    this.markCellUnused(c);
                }
                cursor = cu;
            } else
            if (moves.length !== 1) {
                choicePoints.push(new ChoicePoint(moves.slice(1), history.length));
                cursor = moves[0];
            } else {
                cursor = moves[0];
            }
            history.push(cursor);
            yield new CursorAndOpen(cursor, false);
            this.markCellUsed(cursor);
        }
        this._state = MazeState.SOLUTION_DONE;
    }

    protected advanceToUsed(cursor: Cursor): Cursor {
        do {
            cursor = this.advanceOne(cursor);
        } while(this.isUnused(cursor));
        return cursor;
    }

    protected advanceOne(cursor: Cursor): Cursor {
        const c1 = cursor.move(Direction.right);
        if (c1.col < this.width) {return c1;}
        const c2 = new Cursor(c1.row+1, 0);
        if (c2.row < this.height) { return c2; }
        return new Cursor(0, 0);
    }

    protected isWallOpenInDirection(cursor: Cursor, dir: Direction): boolean {
        switch (dir) {
            case Direction.up:
                return !this.horizontalWalls[cursor.row][cursor.col];
            case Direction.down:
                return !this.horizontalWalls[cursor.row+1][cursor.col];
            case Direction.left:
                return !this.verticalWalls[cursor.row][cursor.col];
            case Direction.right:
                return !this.verticalWalls[cursor.row][cursor.col+1];
        }    
    }

    protected openWallInDirection(cursor: Cursor, dir: Direction): void {
        switch (dir) {
            case Direction.up:
                this.openWall(this.horizontalWalls, cursor);
                 break;
            case Direction.down:
                this.openWall(this.horizontalWalls, new Cursor(cursor.row + 1, cursor.col));
                break;
            case Direction.left:
                this.openWall(this.verticalWalls, cursor);
                break;
            case Direction.right:
                this.openWall(this.verticalWalls, new Cursor(cursor.row, cursor.col+1));
                break;
        }
    }

    protected openWall(walls: boolean[][], cursor: Cursor): void {
        walls[cursor.row][cursor.col] = false;
        ++this._usedCells;
        if (this._usedCells > this.totalCells)
            {this._usedCells = this.totalCells;}
    }

    protected chooseDirectionToUnusedCell(cursor: Cursor): Direction | null {
        const directions: Direction[] = shuffle(getAllDirections());
        for (var dir of directions) {
            if (this.isUnusedInDirection(cursor, dir)) { 
                return dir; 
            }
        }
        return null;
    }

    protected isUnusedInDirection(cursor: Cursor, dir: Direction): boolean {
        return this.isUnused(cursor.move(dir));
    }

    protected isUsed(cursor: Cursor): boolean {
        return !this.isUnused(cursor);
    }

    protected isUnused(cursor: Cursor): boolean {
        const row = cursor.row;
        const col = cursor.col;
        if (row < 0 || row >= this.height) { return false; }
        if (col < 0 || col >= this.width) { return false; }
        return this.verticalWalls[row][col] && this.verticalWalls[row][col + 1] &&
            this.horizontalWalls[row][col] && this.horizontalWalls[row+1][col];
    }

    public print(): void {
        var s: string = "\n";
        for (var row = 0; row <= this.height; ++row) {
            for (var col = 0; col < this.width; ++col) {
                s += this.horizontalWalls[row][col] ? "+---" : "+   ";
            }
            s += "+";
            s += "\n";
            if (row < this.height) {
                for (var col = 0; col <= this.width; ++col) {
                    s += this.verticalWalls[row][col] ? "|" : " ";
                    s += (col < this.width) ? (this.cells[row][col] ? " * " : "   ") : "";
                }
                s += "\n";
            }
        }
        console.log(s);
    }

    protected findStartOfMaze(): Cursor {
        let c: Cursor = new Cursor(0, 0);
        for(;c.col < this.width && !this.isWallOpenInDirection(c, Direction.up); c = c.move(Direction.right)) {
        }
        return c;
    }

    protected atExit(cursor: Cursor): boolean {
        const ath = cursor.row+1 === this.height;
        const o = !this.horizontalWalls[cursor.row+1][cursor.col];
        const r = ath && o;
        return r;
    }

    /**
     * Given a location, look for all adjacent cells where there is
     * no wall to that cell, and the cell is not already used.
     * @param cursor 
     * @returns An array of possible next moves.
     */
    protected findNextSolutionMoves(cursor: Cursor): Cursor[] {
        let moves: Cursor[] = [];
        for(let dir of getAllDirections()) {
            const nextCursor = cursor.move(dir);
            if (this.inMaze(nextCursor) && this.isWallOpenInDirection(cursor, dir) && !this.cellIsUsed(nextCursor)) {
                moves.push(nextCursor);
            }
        }
        return moves;
    }

    protected inMaze(cursor: Cursor): boolean {
        
        return 0 <= cursor.row && cursor.row < this.height &&
            0 <= cursor.col && cursor.col < this.width;
    }

    protected markCellUsed(cursor: Cursor) {
        this.cells[cursor.row][cursor.col] = true;
    }

    protected markCellUnused(cursor: Cursor) {
        this.cells[cursor.row][cursor.col] = false;
    }


    protected cellIsUsed(cursor: Cursor): boolean {
        return this.cells[cursor.row][cursor.col];
    }
}
