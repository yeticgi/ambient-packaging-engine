import { IDisposable } from './misc/IDisposable';
import { ArgEvent } from './misc/Events';
export declare class Time implements IDisposable {
    /**
     * Scalar value for how fast time passes. 0 = paused, 1.0 = normal, 2.0 = 2x fast, 4.0 = 4x fast, etc.
     */
    timeScale: number;
    onUpdate: ArgEvent<Time>;
    private _frameCount;
    private _timeSinceStart;
    private _deltaTime;
    private _clock;
    constructor();
    /**
     * Number of frames that have passed since this game view was created.
     */
    get frameCount(): number;
    /**
     * Number of seconds that have passed since this game view was created. This is affected by timeScale.
     */
    get timeSinceStart(): number;
    /**
     * Time in seconds that has passed since the last frame. This is affected by timeScale.
     */
    get deltaTime(): number;
    update(): void;
    dispose(): void;
}
