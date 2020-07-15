export class Progress {
    loaded: number = 0;
    total: number = 1;

    constructor() {
    }

    set(loaded: number, total: number) {
        this.loaded = loaded;
        this.total = total;
    }

    complete(): void {
        this.loaded = this.total;
    }

    reset(): void {
        this.loaded = 0;
    }

    /**
     * Return the progress as a percentage value in the range of 0-1.
     */
    asPercentage(): number {
        if (this.total > 0) {
            return this.loaded / this.total;
        } else {
            // Assume that if the progress has no total value that it is 100% complete.
            return 1;
        }
    }
}