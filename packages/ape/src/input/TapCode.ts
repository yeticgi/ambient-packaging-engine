import { APEngine } from "../APEngine";
import { APEngineEvents } from "../APEngineEvents";
import { IDisposable } from "../misc/IDisposable";
import { RepeatWrapping } from "three";
import { Flags } from "../misc/Flags";

export class TapCode implements IDisposable {

    /**
     * Debug flags for this tap code object.
     */
    debugFlags = new Flags({
        inputEvents: false,
        processing: false,
    });

    /**
     * Wether or not this tap code be triggered by entering the code via the keyboard.
     */
    allowKeyboardEntry: boolean = false;
    
    private readonly _code: number[];
    private readonly _codeStr: string;
    private _codeEnteredCallback: (tapCode: TapCode) => void;
    private _touchCount: number = 0;
    private _codeQueue: number[] = [];

    get code(): string { return this._codeStr; }

    constructor(code: string, onCodeEntered: (tapCode: TapCode) => void) {
        this._codeEnteredCallback = onCodeEntered;
        this._codeStr = code;
        this._code = [];

        // Convert code string into array of numbers.
        for (let i = 0; i < code.length; i++) {
            const n = Number.parseInt(code[i]);
            if (Number.isInteger(n)) {
                if (n > 0 && n <= 5) {
                     this._code.push(n);
                } else {
                    console.error(`[TapCode] ${n} must be in the range of 1 to 5.`);
                }
            } else {
                console.error(`[TapCode] ${n} is not an integer. Tap code must be string of only integer numbers in the range of 1 to 5.`);
            }
        }

        // Subsribe to APEngine updates so we can reliabely read from the APEngine input module.
        this._onEngineUpdate = this._onEngineUpdate.bind(this);
        APEngineEvents.onUpdate.addListener(this._onEngineUpdate);
    }

    private _onEngineUpdate(): void {
        const touchCount = APEngine.input.getTouchCount();
        if (touchCount > 0) {
            for (let i = 0; i < touchCount; i++) {
                const touch = APEngine.input.getTouchData(i);

                if (APEngine.input.getTouchDown(touch.fingerIndex)) {
                    this._touchCount++;

                    if (this.debugFlags.some('inputEvents')) {
                        console.log(`[TapCode] Touch began. fingerIndex: ${touch.fingerIndex}, count: ${this._touchCount}}`);
                    }
                }
            }
        }

        let touchUp = false;
        for (let i = 0; i < APEngine.input.getTouchCount(); i++) {
            const touch = APEngine.input.getTouchData(i);

            if (APEngine.input.getTouchUp(touch.fingerIndex)) {
                touchUp = true;

                if (this.debugFlags.some('inputEvents')) {
                    console.log(`[TapCode] Touch ended. fingerIndex: ${touch.fingerIndex}, count: ${this._touchCount}}`);
                }
            }
        }

        if (touchUp) {
            this._endTouch(this._touchCount);
            this._touchCount = 0;
        }

        if (this.allowKeyboardEntry) {
            if (APEngine.input.getKeyDown('1')) { this._endTouch(1); }
            if (APEngine.input.getKeyDown('2')) { this._endTouch(2); }
            if (APEngine.input.getKeyDown('3')) { this._endTouch(3); }
            if (APEngine.input.getKeyDown('4')) { this._endTouch(4); }
            if (APEngine.input.getKeyDown('5')) { this._endTouch(5); }
        }
    }

    private _endTouch(touchCount: number): void {
        if (touchCount < 1) { 
            return;
        }

        this._codeQueue.push(touchCount);

        if (this._codeQueue.length > this._code.length) {
            this._codeQueue.splice(0, this._codeQueue.length - this._code.length);
        }

        if (this.debugFlags.some('processing')) {
            console.log(`[TapCode] Code: ${this._codeStr} Current entry: ${JSON.stringify(this._codeQueue)}`);
        }

        if (this._codeQueue.length < this._code.length) {
            // Not enough taps yet.
            if (this.debugFlags.some('processing')) {

            }
            return;
        }

        for (let i = 0; i < this._codeQueue.length; i++) {
            if (this._codeQueue[i] != this._code[i]) {
                // Number doesn't match at this position yet.
                return;
            }
        }

        // Tap code success!
        if (this.debugFlags.some('processing')) {
            console.log(`[TapCode] ${this._codeStr} triggered!`);
        }

        this._codeQueue = [];
        this._codeEnteredCallback(this);
    }

    dispose(): void {
        this._codeEnteredCallback = null;
        APEngineEvents.onUpdate.removeListener(this._onEngineUpdate);
    }
}