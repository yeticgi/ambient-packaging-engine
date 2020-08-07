export declare class ResourceProgress {
    private _id;
    private _weight;
    get id(): string;
    get weight(): number;
    value: number;
    constructor(id: string, weight: number);
}
interface ResourceProgressConfig {
    id: string;
    weight: number;
}
export declare class ResourceProgressMap {
    private _progressMap;
    addProgressObject(config: ResourceProgressConfig): ResourceProgress;
    removeProgressObject(id: string): void;
    clearProgressObjects(): void;
    calculateWeightedMean(): number;
}
export {};
