import * as assert from 'assert';

// You can import and use all API from the 'vscode' module
// as well as import your extension to test it
import * as vscode from 'vscode';
// import * as myExtension from '../../extension';

suite('Extension Test Suite', () => {
	vscode.window.showInformationMessage('Start all tests.');
	// (async function() {
	// 	const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));
	// 	console.log(1);
	// 	await sleep(10000);
	// 	console.log(2);
	// 	})();
	test('Sample test', () => {
		// assert.strictEqual(-1, [1, 2, 3].indexOf(2));
		// assert.strictEqual(-1, [1, 2, 3].indexOf(0));
	});
});
