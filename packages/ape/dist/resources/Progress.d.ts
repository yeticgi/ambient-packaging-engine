export declare class Progress {
    loaded: number;
    total: number;
    constructor();
    set(loaded: number, total: number): void;
    complete(): void;
    reset(): void;
    /**
     * Return the progress as a percentage value in the range of 0-1.
     */
    asPercentage(): number;
}
