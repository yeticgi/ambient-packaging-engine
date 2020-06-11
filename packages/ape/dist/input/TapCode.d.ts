import { IDisposable } from "../misc/IDisposable";
import { Flags } from "../misc/Flags";
export declare class TapCode implements IDisposable {
    /**
     * Debug flags for this tap code object.
     */
    debugFlags: Flags<{
        inputEvents: false;
        processing: false;
    }>;
    /**
     * Wether or not this tap code be triggered by entering the code via the keyboard.
     */
    allowKeyboardEntry: boolean;
    private readonly _code;
    private readonly _codeStr;
    private _codeEnteredCallback;
    private _touchCount;
    private _codeQueue;
    get code(): string;
    constructor(code: string, onCodeEntered: (tapCode: TapCode) => void);
    private _onEngineUpdate;
    private _endTouch;
    dispose(): void;
}
