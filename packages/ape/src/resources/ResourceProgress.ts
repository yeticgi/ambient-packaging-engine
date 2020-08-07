export class ResourceProgress {
    private _id: string;
    private _weight: number;

    get id(): string { return this._id; }
    get weight(): number { return this._weight; }
    
    value: number = 0;

    constructor(id: string, weight: number) {
        this._id = id;
        this._weight = weight;
    }
}

interface ResourceProgressConfig {
    id: string;
    weight: number;
}

export class ResourceProgressMap {

    private _progressMap = new Map<string, ResourceProgress>();

    addProgressObject(config: ResourceProgressConfig): ResourceProgress {
        let p = this._progressMap.get(config.id);
        if (!p) {
            p = new ResourceProgress(config.id, config.weight);
            this._progressMap.set(config.id, p);
        }

        return p;
    }

    removeProgressObject(id: string): void {
        this._progressMap.delete(id);
    }

    clearProgressObjects(): void {
        this._progressMap = new Map();
    }

    calculateWeightedMean(): number {
        if (this._progressMap.size === 0) {
            return 0;
        }

        let pSum = 0;
        let wSum = 0;

        for (const [id, p] of this._progressMap) {
            pSum += p.value * p.weight;
            wSum += p.weight;
        }

        const mean = pSum / wSum;
        return mean;
    }

}