// import * as assert from 'assert';
import {Maze}  from './maze.js';

console.log("maze.tests.ts");
var m = new Maze(10, 10);
m.generate();
m["print"]();

// // You can import and use all API from the 'vscode' module
// // as well as import your extension to test it
// import * as vscode from 'vscode';
// // import * as myExtension from '../../extension';

// suite('Maze Test Suite', () => {
// 	vscode.window.showInformationMessage('Start all tests.');

// 	test('constructor', () => {
//         const m = new maze.Maze(10, 10);
//         m["print"];
// 		assert.strictEqual(-1, [1, 2, 3].indexOf(5));
// 		assert.strictEqual(-1, [1, 2, 3].indexOf(0));
// 	});
// });
