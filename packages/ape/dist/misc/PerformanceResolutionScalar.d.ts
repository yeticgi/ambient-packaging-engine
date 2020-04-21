import { WebGLRenderer } from "three";
export interface IParams {
    startEnabled?: boolean;
    targetFramerate?: number;
    targetPixelRatio?: number;
    minimumPixelRatio?: number;
    pixelRatioAdjustRate?: number;
}
export declare class PerformanceResolutionScalar {
    enabled: boolean;
    targetFramerate: number;
    targetPixelRatio: number;
    minimumPixelRatio: number;
    pixelRatioAdjustRate: number;
    debugUI: PerformanceResolutionScalarDebugUI;
    private _renderer;
    private _lastFrameTimestamp;
    private _lastFrameTime;
    constructor(renderer: WebGLRenderer, options?: IParams);
    update(): void;
    getCurrentPixelRatio(): number;
    getLastFrameTime(): number;
}
declare class PerformanceResolutionScalarDebugUI {
    private _rootEl;
    private _pixelRatioEl;
    private _minMaxEl;
    private _frameTimeEl;
    private _customTextMap;
    get visible(): boolean;
    set visible(visible: boolean);
    constructor();
    private _addTextElement;
    customText(id: string, text: string): void;
    update(scalar: PerformanceResolutionScalar): void;
}
export {};
