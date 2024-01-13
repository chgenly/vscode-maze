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
    let used = 0;
    for (const cdo of maze.generate()) {
        ++used;
        assert.strictEqual(width * height, maze.totalCells);
        assert.strictEqual(maze.state, MazeState.GENERATION_IN_PROGRESS);
        if (maze.totalCells + 1 === used) {
            assert.strictEqual(maze.usedCells, maze.usedCells);
        } else {
            assert.strictEqual(used, maze.usedCells);
        }
    }
    assert.strictEqual(maze.state, MazeState.GENERATION_DONE);
}

class Path {
    constructor(public readonly cursor: Cursor, public readonly previousPath: Path | null) { }
}
/** Maze must be fully connected and acyclic. */
function testConnectivity(): void {
    const zz = new Cursor(0, 0);
    let paths: Path[] = [new Path(new Cursor(0, 0), null)];
    const rows = 10;
    const cols = rows;
    const maze = new TestMaze(rows, cols);
    for (const x of maze.generate()) { }
    maze.print();
    maze.markCellUsed(zz);
    let used = 1;

    while (paths.length !== 0) {
        assert.ok(used <= maze.totalCells, `Too many cells: ${used}`);
        const path: Path | undefined = paths.pop();
        if (!path) {
            assert.ok(false, "can't happen");
            return;
        }
        let cs: Cursor[] = [];
        let cursor = path.cursor;
        for (let dir of getAllDirections()) { cs.push(cursor.move(dir)); }
        // console.log(`pristine cs=${JSON.stringify(cs)}`);
        cs = cs
            .filter(c => maze.inMaze(c))
            .filter(c => {
                const b = !maze.isWallBetween(cursor, c);
                !maze.isWallBetween(cursor, c);
                return b;
            });
        // console.log(`filtered1 cs=${JSON.stringify(cs)}`);
        const prevC = path?.previousPath?.cursor;
        if (prevC) {
            cs = cs.filter(c => !c.eq(prevC));
        }
        // console.log(`final cs=${JSON.stringify(cs)}`);
        cs.forEach(c => {
            assert.ok(!maze.isCellUsed(c), `Loop encountered at ${JSON.stringify(c)}`);
            ++used;
            maze.markCellUsed(c);
            paths.push(new Path(c, path));
        });
    }
    assert.strictEqual(used, maze.totalCells, `Incorrent number of used cells: ${used}`);
}

function testSolution(): void {
}