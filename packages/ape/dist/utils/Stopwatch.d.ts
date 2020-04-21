/**
 * Simple object that can mesaure the passage of time.
 * Useful for debugging code performance or simply getting elapsed time values.
 */
export declare class Stopwatch {
    private _startTime;
    private _stopTime;
    /**
     * Create a new Stopwatch with the start time set to time of creation.
     */
    constructor();
    /**
     * STart the stopwatch. Set's the start time to now.
     */
    start(): void;
    /**
     * Stop the stopwatch. Set's the stop time to now.
     */
    stop(): void;
    /**
     * Reset the stopwatch. Clears both the start and stop time.
     */
    reset(): void;
    /**
     * Return number of milliseconds that have elapsed.
     */
    elapsed(): number;
}
