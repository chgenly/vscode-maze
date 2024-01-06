import * as vscode from 'vscode';
import { MazeDimesions } from './maze';

export function getDimensions(): Promise<MazeDimesions> {
    const promise = new Promise<MazeDimesions>((resolve, reject) => {
        const inputBox = vscode.window.createInputBox();
        inputBox.title = "Enter maze dimensions (row, col)";
        inputBox.placeholder = "10, 10";
        inputBox.value = "10, 10";
        inputBox.onDidChangeValue(() => {
            validateInput(inputBox);
        });
        inputBox.onDidHide(() => {
            inputBox.dispose();
            reject();
        });
        inputBox.onDidAccept(() => {
            const dimensions = validateInput(inputBox);
            if (dimensions) {
                resolve(dimensions);
                console.log(`accept input.value=${JSON.stringify(dimensions)}`);
                inputBox.dispose();
            }
        });

        inputBox.show();
    });
    return promise;
}

function validateInput(inputBox: vscode.InputBox): MazeDimesions | null {
    const re = /^\s*(\d+)[\s,]+(\d+)\s*$/;
    const match = inputBox.value.match(re);
    if (match === null) {
        inputBox.validationMessage = "Please enter two positive integers.";
        return null;
    } else {
        const v1 = parseInt(match[1]);
        const v2 = parseInt(match[2]);
        if (validateInt(inputBox, v1, "first") && validateInt(inputBox, v2, "second")) {
            inputBox.validationMessage = undefined;
            return {rows:v1, cols:v2};
        }
        return null;
    }
    function validateInt(inputBox: vscode.InputBox, v: number, place: string): boolean {
        if (v === 0) {
            inputBox.validationMessage = place + " number must not be 0.";
            return false;
        }
        if (v > 50) {
            inputBox.validationMessage = place + " number must be 50 or less.";
            return false;
        }
        return true;
    }
}