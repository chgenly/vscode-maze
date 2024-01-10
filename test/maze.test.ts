import * as assert from 'assert';
import { CursorDirectionAndOpen, Maze, MazeState } from '../src/maze.js';

suite('Maze.ts Test Suite', () => {
    test('generation', () => {
        testGeneration();
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
    maze.print();
}
function testSolution(): void {

}
