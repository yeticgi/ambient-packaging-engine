import { IDisposable } from "../misc/IDisposable";
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
        this._onKeyDown = this._onKeyDown.bind(this);
        this._onTouchStart = this._onTouchStart.bind(this);
        this._onTouchEnd = this._onTouchEnd.bind(this);

        document.body.addEventListener('keydown', this._onKeyDown);
        document.body.addEventListener('touchstart', this._onTouchStart);
        document.body.addEventListener('touchend', this._onTouchEnd);
    }

    private _onKeyDown(event: KeyboardEvent): void {
        if (!event.repeat && this.allowKeyboardEntry) {
            switch (event.key) {
                case '1': 
                    this._endTouch(1);
                    break;
                case '2':
                    this._endTouch(2);
                    break;
                case '3':
                    this._endTouch(3);
                    break;
                case '4':
                    this._endTouch(4);
                    break;
                case '5':
                    this._endTouch(5);
                    break;
            }
        }
    }

    private _onTouchStart(event: TouchEvent): void {
        this._touchCount = event.touches.length;

        if (this.debugFlags.some('inputEvents')) {
            console.log(`[TapCode] Touch began. count: ${this._touchCount}`);
        }
    }

    private _onTouchEnd(event: TouchEvent): void {
        if (event.touches.length < this._touchCount) {
            if (this.debugFlags.some('inputEvents')) {
                console.log(`[TapCode] Touch ended. count: ${this._touchCount}`);
            }

            this._endTouch(this._touchCount);
            this._touchCount = 0;
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

        document.body.removeEventListener('keydown', this._onKeyDown);
        document.body.removeEventListener('touchstart', this._onTouchStart);
        document.body.removeEventListener('touchend', this._onTouchEnd);
    }
}