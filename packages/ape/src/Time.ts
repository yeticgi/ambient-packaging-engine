import { Clock } from 'three';
import { IDisposable } from './misc/IDisposable';
import { ArgEvent } from './misc/Events';

interface TimeWaitPromise { 
    resolveTime: number;
    resolve: () => void;
}

interface FrameWaitPromise {
    frame: number;
    resolve: () => void;
}

export class Time implements IDisposable {

    /**
     * Scalar value for how fast time passes. 0 = paused, 0.5 = half speed, 1.0 = normal, 2.0 = 2x fast, 4.0 = 4x fast, etc.
     */
    timeScale: number = 1.0;

    onUpdate: ArgEvent<Time> = new ArgEvent();
    
    private _frameCount: number = 0;
    private _timeSinceStart: number = 0;
    private _deltaTime: number = 0;
    private _clock: Clock;
    private _timeWaitPromises: TimeWaitPromise[] = [];
    private _frameWaitPromises: FrameWaitPromise[] = [];
    
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

        // Check frame wait promises and resolve any that are complete.
        if (this._frameWaitPromises.length > 0) {
            this._frameWaitPromises = this._frameWaitPromises.filter((fw) => {
                if (fw.frame <= this._frameCount) {
                    fw.resolve();
                    return false;
                } else {
                    return true;
                }
            });
        }  

        // Check time wait promises and resolve any that are complete.
        if (this._timeWaitPromises.length > 0) {
            this._timeWaitPromises = this._timeWaitPromises.filter((tw) => {
                if (tw.resolveTime <= this._timeSinceStart) {
                    tw.resolve();
                    return false;
                } else {
                    return true;
                }
            });
        }

        this.onUpdate.invoke(this);
    }

    /**
     * Return a promise that waits the given number of seconds before resolving.
     * @param seconds Number of seconds to wait before resolving the promise.
     */
    async waitForSeconds(seconds: number): Promise<void> {
        if (seconds <= 0) {
            return;
        }

        return new Promise((resolve) => {
            this._timeWaitPromises.push({
                resolveTime: this._timeSinceStart + seconds,
                resolve
            });
        });
    }

    /**
     * Return a promise that resolves once the next frame has started.
     */
    async waitForNextFrame(): Promise<void> {
        return new Promise((resolve) => {
            this._frameWaitPromises.push({
                frame: this._frameCount + 1,
                resolve
            });
        });
    }

    /**
     * Return a promise that resolves once the the given number of frames has passed.
     */
    async waitForFrames(frameCount: number): Promise<void> {
        return new Promise((resolve) => {
            this._frameWaitPromises.push({
                frame: this._frameCount + frameCount,
                resolve
            });
        });
    }

    dispose(): void {
    }
}
