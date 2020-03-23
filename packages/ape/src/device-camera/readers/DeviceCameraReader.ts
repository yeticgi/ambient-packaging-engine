import { DeviceCamera } from '../DeviceCamera';
import { IDisposable } from '../../misc/IDisposable';

export interface IDeviceCameraReaderOptions {
    deviceCamera: DeviceCamera
}

export class DeviceCameraReader implements IDisposable {

    private _deviceCamera: DeviceCamera;
    private _canvas: HTMLCanvasElement;
    private _running: boolean = false;
    private _updateHandle: number;

    get deviceCamera(): DeviceCamera { return this._deviceCamera };

    get canvas(): HTMLCanvasElement { return this._canvas };

    get running(): boolean { return this._running; };

    constructor() {
        this._canvas = document.createElement('canvas');

        this._update = this._update.bind(this);
    }

    /**
     * Start the camera reader with the given options.
     */
    start(options: IDeviceCameraReaderOptions): void {
        if (this._running) {
            throw new Error(`${this.constructor.name} is already running. Check 'running' property before calling start()`);
        }
        
        this._deviceCamera = options.deviceCamera;
        this._running = true;

        this._updateHandle = requestAnimationFrame(this._update);
    }

    private _update(): void {
        if (this._running && this._deviceCamera && this._deviceCamera.isPlaying()) {
            const video = this._deviceCamera.getVideoElement();
            this._canvas.width = video.videoWidth;
            this._canvas.height = video.videoHeight;
            const ctx = this._canvas.getContext('2d');
            ctx.drawImage(video, 0, 0, this._canvas.width, this._canvas.height);

            this.onRenderedToCanvas(this._canvas);
        }

        this._updateHandle = requestAnimationFrame(this._update);
    }

    protected onRenderedToCanvas(canvas: HTMLCanvasElement): void {
        // Do nothing by default.
    }

    stop(): void {
        this._deviceCamera = null;
        this._running = false;

        if (typeof this._updateHandle === 'number') {
            cancelAnimationFrame(this._updateHandle);
        }
    }

    dispose(): void {
        this._deviceCamera = null;
        this._canvas = null;
    }
}