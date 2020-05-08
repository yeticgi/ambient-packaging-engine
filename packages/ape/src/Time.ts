import { Clock } from 'three';
import { IDisposable } from './misc/IDisposable';
import { ArgEvent } from './misc/Events';
import { PropertySpectator } from './misc/PropertySpectator';

export class Time implements IDisposable {

    /**
     * Scalar value for how fast time passes. 0 = paused, 1.0 = normal, 2.0 = 2x fast, 4.0 = 4x fast, etc.
     */
    timeScale: number = 1.0;

    onUpdate: ArgEvent<Time> = new ArgEvent();
    
    private _frameCount: number = 0;
    private _timeSinceStart: number = 0;
    private _deltaTime: number = 0;
    private _clock: Clock;
    
    constructor() {
        this._frameCount = 0;
        this._timeSinceStart = 0;
        this._deltaTime = 0;
        this._clock = new Clock(true);
    }

    /**
     * Number of frames that have passed since this game view was created.
     */
    get frameCount(): number {
        return this._frameCount;
    }

    /**
     * Number of seconds that have passed since this game view was created. This is affected by timeScale.
     */
    get timeSinceStart(): number {
        return this._timeSinceStart;
    }

    /**
     * Time in seconds that has passed since the last frame. This is affected by timeScale.
     */
    get deltaTime(): number {
        return this._deltaTime;
    }

    update() {
        // Track time.
        this._frameCount += 1;

        const clockDelta = this._clock.getDelta();
        this._deltaTime = clockDelta * this.timeScale;
        
        this._timeSinceStart += this._deltaTime;

        this.onUpdate.invoke(this);
    }

    dispose(): void {
    }
}
