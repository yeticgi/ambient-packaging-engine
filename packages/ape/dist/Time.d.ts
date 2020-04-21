import { IDisposable } from './misc/IDisposable';
import { ArgEvent } from './misc/Events';
export declare class Time implements IDisposable {
    paused: boolean;
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
     * Number of seconds that have passed since this game view was created.
     */
    get timeSinceStart(): number;
    /**
     * Time in seconds that has passed since the last frame.
     */
    get deltaTime(): number;
    update(): void;
    dispose(): void;
}
