
/**
 * Simple object that can mesaure the passage of time. 
 * Useful for debugging code performance or simply getting elapsed time values.
 */
export class Stopwatch {

    private _startTime: number = null;
    private _stopTime: number = null;

    /**
     * Create a new Stopwatch with the start time set to time of creation.
     */
    constructor() {
        this.start();
    }

    /**
     * STart the stopwatch. Set's the start time to now.
     */
    start(): void {
        this._startTime = Date.now();
        this._stopTime = null;
    }

    /**
     * Stop the stopwatch. Set's the stop time to now.
     */
    stop(): void {
        this._stopTime = Date.now();
    }

    /**
     * Reset the stopwatch. Clears both the start and stop time.
     */
    reset(): void {
        this._startTime = null;
        this._stopTime = null;
    }

    /**
     * Return number of milliseconds that have elapsed.
     */
    elapsed(): number {
        if (this._startTime) {
            const endTime = this._stopTime ?? Date.now();
            return endTime - this._startTime;
        } else {
            return 0;
        }
    }
}