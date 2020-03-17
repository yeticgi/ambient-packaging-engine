import { WebGLRenderer } from "three";
import { clamp, hasValue } from "../utils/Utils";

export interface IParams {
    startEnabled?: boolean;
    targetFramerate?: number;
    targetPixelRatio?: number;
    minimumPixelRatio?: number;
    pixelRatioAdjustRate?: number;
}

export class PerformanceResolutionScalar {
    enabled: boolean = true;
    targetFramerate: number = 60;
    targetPixelRatio: number;
    minimumPixelRatio: number = 0.5;
    pixelRatioAdjustRate: number = 0.01;
    debugUI: PerformanceResolutionScalarDebugUI;

    private _renderer: WebGLRenderer;
    private _lastFrameTimestamp: number = -1;
    private _lastFrameTime: number = -1;

    constructor(renderer: WebGLRenderer, options?: IParams) {
        this._renderer = renderer;

        this.debugUI = new PerformanceResolutionScalarDebugUI();
        this.debugUI.visible = false;

        if (!options) {
            options = {};
        }

        if (hasValue(options.startEnabled)) {
            this.enabled = options.startEnabled;
        }

        if (hasValue(options.targetFramerate)) {
            this.targetFramerate = options.targetFramerate;
        }

        if (hasValue(options.targetPixelRatio)) {
            this.targetPixelRatio = options.targetPixelRatio;
        } else {
            this.targetPixelRatio = renderer.getPixelRatio();
        }

        if (hasValue(options.minimumPixelRatio)) {
            this.minimumPixelRatio = options.minimumPixelRatio;
        }

        if (hasValue(options.pixelRatioAdjustRate)) {
            this.pixelRatioAdjustRate = options.pixelRatioAdjustRate;
        }
    }

    update(): void {
        const frameTimestamp = performance.now();

        if (this._lastFrameTimestamp > 0 && this.enabled) {
            const currentFrameTime = frameTimestamp - this._lastFrameTimestamp;
            const targetFrameTime = Math.ceil(1000 / this.targetFramerate);
            this.debugUI.customText(
                "targetTime",
                `Target Frame Time: ${targetFrameTime.toFixed(2)}`
            );

            // Reference: https://software.intel.com/en-us/articles/dynamic-resolution-rendering-article/
            const t = (targetFrameTime - currentFrameTime) / targetFrameTime;
            this.debugUI.customText("t", `T: ${t.toFixed(2)}`);

            let ratioDelta = 0;
            if (t < 0) {
                ratioDelta = -this.pixelRatioAdjustRate;
            } else if (t > 0) {
                ratioDelta = this.pixelRatioAdjustRate;
            }
            // const ratioDelta: number =
            // this.pixelRatioAdjustRate * this._renderer.getPixelRatio() * t;
            this.debugUI.customText(
                "ratioDelta",
                `Ratio Delta: ${ratioDelta.toFixed(2)}`
            );

            if (ratioDelta !== 0) {
                // Apply pixel ratio adjustment.
                const newPixelRatio = clamp(
                    this._renderer.getPixelRatio() + ratioDelta,
                    this.minimumPixelRatio,
                    this.targetPixelRatio
                );

                // console.log(`new pixel ratio: ${newPixelRatio}`);

                if (this._renderer.getPixelRatio() !== newPixelRatio) {
                    // console.log("new pixel ratio: " + newPixelRatio);
                    this._renderer.setPixelRatio(newPixelRatio);
                }
            }

            this._lastFrameTime = currentFrameTime;
        }

        this._lastFrameTimestamp = frameTimestamp;
        this.debugUI.update(this);
    }

    getCurrentPixelRatio(): number {
        return this._renderer.getPixelRatio();
    }

    getLastFrameTime(): number {
        return this._lastFrameTime;
    }
}

class PerformanceResolutionScalarDebugUI {
    private _rootEl: HTMLDivElement;
    private _pixelRatioEl: HTMLParagraphElement;
    private _minMaxEl: HTMLParagraphElement;
    private _frameTimeEl: HTMLParagraphElement;

    private _customTextMap: Map<string, HTMLParagraphElement>;

    get visible(): boolean {
        return this._rootEl.style.display === "block";
    }

    set visible(visible: boolean) {
        this._rootEl.style.display = visible ? "block" : "none";
    }

    constructor() {
        this._rootEl = document.createElement("div");
        document.body.appendChild(this._rootEl);
        this._rootEl.style.position = "absolute";
        this._rootEl.style.left = 0 + "px";
        this._rootEl.style.bottom = 0 + "px";
        this._rootEl.style.minWidth = 180 + "px";
        this._rootEl.style.padding = 2 + "px";
        this._rootEl.style.backgroundColor = "#000";
        this._rootEl.style.fontFamily = "Courier New";

        this._pixelRatioEl = this._addTextElement(this._rootEl);
        this._minMaxEl = this._addTextElement(this._rootEl);
        this._frameTimeEl = this._addTextElement(this._rootEl);
    }

    private _addTextElement(parent: HTMLElement): HTMLParagraphElement {
        const textEl = document.createElement("p");
        textEl.style.color = "#fff";
        textEl.style.margin = 1 + "px";
        parent.appendChild(textEl);
        return textEl;
    }

    public customText(id: string, text: string): void {
        if (!this.visible) {
            return;
        }

        if (!this._customTextMap) {
            this._customTextMap = new Map();
        }

        let textEl = this._customTextMap.get(id);
        if (!textEl) {
            textEl = this._addTextElement(this._rootEl);
            this._customTextMap.set(id, textEl);
        }

        textEl.innerText = text;
    }

    update(scalar: PerformanceResolutionScalar): void {
        if (!this.visible) {
            return;
        }
        
        this._pixelRatioEl.innerText = `Pixel Ratio: ${scalar
            .getCurrentPixelRatio()
            .toFixed(2)}`;

        this._minMaxEl.innerText = `Min/Max: ${scalar.minimumPixelRatio} / ${
            scalar.targetPixelRatio
            }`;

        this._frameTimeEl.innerHTML = `Frame Time: ${scalar
            .getLastFrameTime()
            .toFixed(2)}`;
    }
}
