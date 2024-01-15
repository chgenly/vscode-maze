import * as assert from 'assert';
import { Cursor, CursorDirectionAndOpen, Direction, Maze, MazeState, getAllDirections } from '../src/maze.js';

// function getAllDirectionsPublic() {
//     return getAllDirections();
// }

class TestMaze extends Maze {
    public findStartOfMaze(): Cursor {
        return super.findStartOfMaze();
    }
    public isWallOpenInDirection(cursor: Cursor, dir: Direction): boolean {
        return super.isWallOpenInDirection(cursor, dir);
    }
    public openWallInDirection(cursor: Cursor, dir: Direction): void {
        return super.openWallInDirection(cursor, dir);
    }
    public atExit(cursor: Cursor): boolean {
        return super.atExit(cursor);
    }
    public isAllClosedWalls(cursor: Cursor): boolean {
        return super.isAllClosedWalls(cursor);
    }
    public isAnyWallOpen(cursor: Cursor): boolean {
        return super.isAnyWallOpen(cursor);
    }
    public findNextSolutionMoves(cursor: Cursor): Cursor[] {
        return super.findNextSolutionMoves(cursor);
    }
    public isWallBetween(c1: Cursor, c2: Cursor): boolean {
        return super.isWallBetween(c1, c2);
    }
    public inMaze(cursor: Cursor): boolean {
        return super.inMaze(cursor);
    }
    public markCellUsed(cursor: Cursor) {
        super.markCellUsed(cursor);
    }
    public isCellUsed(cursor: Cursor): boolean {
        return super.isCellUsed(cursor);
    }
    public countOpenings(entrance: boolean): number {
        const row = entrance ? 0 : this.height;
        return new Array(this.width).fill(0)
            .reduce((acc, _1, col, _2) =>
                (acc + this.isWallOpenInDirection(new Cursor(row, col), Direction.up) ? 1 : 0)
                ,
                0);
    }
    public findEndOfMaze(): Cursor {
        let c: Cursor = new Cursor(this.height-1, 0);
        for (; c.col < this.width && !this.isWallOpenInDirection(c, Direction.down); c = c.move(Direction.right)) {
        }
        return c;
    }
    public markAllCellsUnused(): void {
        for (let row = 0; row < this.height; ++row) {
            for (let col = 0; col < this.width; ++col) {
                this.markCellUnused(new Cursor(row, col));
            }
        }
    }
}

suite('Maze.ts Test Suite', () => {
    suite('isWallOpenInDirection', () => {
        test('isWallOpenInDirection up', () => {
            const m: TestMaze = new TestMaze(10, 10);
            for (let i = 0; i < m.width; ++i) {
                assert.strictEqual(m.isWallOpenInDirection(new Cursor(0, i), Direction.up), false);
            }
            m.openWallInDirection(new Cursor(0, 2), Direction.up);
            for (let i = 0; i < m.width; ++i) {
                assert.strictEqual(m.isWallOpenInDirection(new Cursor(0, i), Direction.up), i === 2);
            }
        });
        test('isWallOpenInDirection down', () => {
            const m: TestMaze = new TestMaze(10, 10);
            for (let i = 0; i < m.width; ++i) {
                assert.strictEqual(m.isWallOpenInDirection(new Cursor(0, i), Direction.down), false);
            }
            m.openWallInDirection(new Cursor(0, 3), Direction.down);
            for (let i = 0; i < m.width; ++i) {
                assert.strictEqual(m.isWallOpenInDirection(new Cursor(0, i), Direction.down), i === 3);
            }
        });
        test('isWallOpenInDirection left', () => {
            const m: TestMaze = new TestMaze(10, 10);
            for (let i = 0; i < m.width; ++i) {
                assert.strictEqual(m.isWallOpenInDirection(new Cursor(0, i), Direction.left), false);
            }
            m.openWallInDirection(new Cursor(0, 0), Direction.left);
            for (let i = 0; i < m.width; ++i) {
                assert.strictEqual(m.isWallOpenInDirection(new Cursor(0, i), Direction.left), i === 0);
            }
        });
        test('isWallOpenInDirection right', () => {
            const m: TestMaze = new TestMaze(10, 10);
            for (let i = 0; i < m.width; ++i) {
                assert.strictEqual(m.isWallOpenInDirection(new Cursor(0, i), Direction.right), false);
            }
            m.openWallInDirection(new Cursor(0, 1), Direction.right);
            for (let i = 0; i < m.width; ++i) {
                assert.strictEqual(m.isWallOpenInDirection(new Cursor(0, i), Direction.right), i === 1);
            }
        });
    });
    test('isUsed', () => {
        for (let dir of getAllDirections()) {
            let cols: number[] = [];
            switch (dir) {
                case Direction.up:
                case Direction.down:
                    cols = [2];
                    break;
                case Direction.left:
                    cols = [1, 2];
                    break;
                case Direction.right:
                    cols = [2, 3];
                    break;
            }
            const m: TestMaze = new TestMaze(10, 10);
            for (let col = 0; col < m.width; ++col) {
                assert.strictEqual(m.isAnyWallOpen(new Cursor(0, col)), false, `init isUsed dir=${dir} col=${col}`);
                assert.strictEqual(m.isAllClosedWalls(new Cursor(0, col)), true, `init isUnused dir=${dir} col=${col}`);
            }
            m.openWallInDirection(new Cursor(0, 2), dir);
            for (let col = 0; col < m.width; ++col) {
                assert.strictEqual(m.isAnyWallOpen(new Cursor(0, col)), cols.indexOf(col) !== -1, `isUsed dir=${dir} col=${col}`);
                assert.strictEqual(m.isAllClosedWalls(new Cursor(0, col)), cols.indexOf(col) === -1, `isUnused dir=${dir} col=${col}`);
            }
        }
    });
    test('findStartOfMaze', () => {
        const m: TestMaze = new TestMaze(10, 10);
        m.openWallInDirection(new Cursor(0, 3), Direction.up);
        const cursor = m.findStartOfMaze();
        assert.strictEqual(cursor.row, 0);
        assert.strictEqual(cursor.col, 3);
    });
    test('atExit', () => {
        const m: TestMaze = new TestMaze(10, 10);
        m.openWallInDirection(new Cursor(10, 5), Direction.up);
        for (let col = 0; col < m.width; ++col) {
            assert.strictEqual(m.atExit(new Cursor(9, col)), col === 5);
        }
    });
    test('generation', () => {
        testGeneration();
    });
    test('connectivity', () => {
        testConnectivity();
    });
    test('solution', () => {
        testSolution();
    });
});

function testGeneration(): void {
    console.log("maze.tests.ts");
    var width = 10;
    var height = 10;
    var maze = new Maze(width, height);
    assert.strictEqual(maze.state, MazeState.GENERATION_NOT_STARTED);
    let openedWallCount = 0;
    for (const cdo of maze.generate()) {
        ++openedWallCount;
        assert.strictEqual(width * height, maze.totalCells, `Wrong number of total cells ${maze.totalCells}\n${maze}`);
        assert.strictEqual(maze.state, MazeState.GENERATION_IN_PROGRESS);
        if (maze.totalCells + 1 === openedWallCount) {
            // This is allowed because in a complete maze we will open one more wall, than there are cells.
        } else {
            assert.strictEqual(maze.usedCells, openedWallCount, `Wrong number of used cells\n${maze}`);
        }
    }
    assert.strictEqual(maze.state, MazeState.GENERATION_DONE);
}

/** A path is a cons style list of cursor. */
class Path {
    constructor(public readonly cursor: Cursor, public readonly previousPath: Path | null) { }
}
/** Maze must be fully connected and acyclic. */
function testConnectivity(): void {
    const rows = 10;
    const cols = rows;
    const maze = new TestMaze(rows, cols);
    for (const x of maze.generate()) { }
    const zz = new Cursor(0, 0);

    const [used, _] = findAllPaths(maze, zz);

    assert.strictEqual(used, maze.totalCells, `Incorrent number of used cells: ${used}\n${maze}`);
    assert.strictEqual(maze.countOpenings(true), 1, `Incorrect number of entrances\n${maze}`);
    assert.strictEqual(maze.countOpenings(false), 1, `Incorrect number of exits\n${maze}`);
}

function testSolution(): void {
    const rows = 10;
    const cols = rows;
    const maze = new TestMaze(rows, cols);
    for (const x of maze.generate()) { }
    const startCursor = maze.findStartOfMaze();
    const endCursor = maze.findEndOfMaze();

    const [used, solution] = findAllPaths(maze, startCursor, endCursor);
    maze.markAllCellsUnused();
    let s: Path | null = null;
    for (const cao of maze.solve()) {
        const cursor = cao.cursor;
        const open = cao.open;
        if (open) {
            if (s === null) {
                assert.ok(false, "Null path can't happen.");
            } else {
                s = s.previousPath;
            }
        } else {
            s = new Path(cursor, s);
        }
    }
    assert.deepStrictEqual(s, solution, `Incorrect solution path.\n${maze}`);
}

function findAllPaths(maze: TestMaze, startCursor: Cursor, endCursor?: Cursor): [number, Path | null] {
    let paths: Path[] = [new Path(startCursor, null)];
    maze.markCellUsed(startCursor);
    let used = 1;
    let solution: Path | null = null;

    while (paths.length !== 0) {
        assert.ok(used <= maze.totalCells, `Too many cells: ${used}\n${maze}`);
        const path: Path | undefined = paths.pop();
        if (!path) {
            assert.ok(false, "can't happen");
        }
        let nextCursors: Cursor[] = [];
        let cursor = path.cursor;
        for (let dir of getAllDirections()) { nextCursors.push(cursor.move(dir)); }
        nextCursors = nextCursors
            .filter(c => maze.inMaze(c))
            .filter(c => !maze.isWallBetween(cursor, c));
        const prevCursor = path?.previousPath?.cursor;
        if (prevCursor) {
            nextCursors = nextCursors.filter(c => !c.eq(prevCursor));
        }
        nextCursors.forEach(c => {
            assert.ok(!maze.isCellUsed(c), `Loop encountered at ${JSON.stringify(c)}\n${maze}`);
            ++used;
            const newPath = new Path(c, path);
            maze.markCellUsed(c);
            paths.push(newPath);
            if (endCursor && c.eq(endCursor)) { solution = newPath; }
        });
    }
    return [used, solution];
}

