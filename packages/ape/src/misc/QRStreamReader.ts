import { DeviceCamera } from './DeviceCamera';
import jsQR, { Options } from 'jsqr';
import { IDisposable } from './IDisposable';
import { getOptionalValue } from '../Utils';
import { ArgEvent } from './Events';

export interface IQRStreamReaderOptions {
    deviceCamera: DeviceCamera
}

export class QRStreamReader implements IDisposable {

    private _deviceCamera: DeviceCamera;
    private _canvas: HTMLCanvasElement;
    private _started: boolean = false;
    private _tickHandle: number;

    /**
     * Event that is invoked when a qr code is scanned.
     */
    onQRScanned: ArgEvent<string> = new ArgEvent();

    constructor() {
        this._canvas = document.createElement('canvas');

        this.tick = this.tick.bind(this);
    }

    getDeviceCamera(): DeviceCamera {
        return this._deviceCamera;
    }

    getCanvas(): HTMLCanvasElement {
        return this._canvas;
    }

    isStarted(): boolean {
        return this._started;
    }

    /**
     * 
     * @param options 
     */
    start(options: IQRStreamReaderOptions): void {
        if (this._started) {
            throw `Instance of QRStreamReader is already running`;
        }

        this._started = true;

        this._deviceCamera = options.deviceCamera;
        
        this._tickHandle = requestAnimationFrame(this.tick);
    }

    tick() {
        if (this._started && this._deviceCamera.isPlaying()) {
            const video = this._deviceCamera.getVideoElement();
            const ctx = this._canvas.getContext('2d');
            ctx.drawImage(video, 0, 0, this._canvas.width, this._canvas.height);
            const imageData = ctx.getImageData(0, 0, this._canvas.width, this._canvas.height);
            const code = jsQR(imageData.data, imageData.width, imageData.height, {
                inversionAttempts: "dontInvert"
            });
    
            if (code) {
                this.onQRScanned.invoke(code.data);
            }
        }

        this._tickHandle = requestAnimationFrame(this.tick);
    }

    stop(): void {
        this._started = false;

        if (typeof this._tickHandle === 'number') {
            cancelAnimationFrame(this._tickHandle);
        }
    }

    dispose(): void {
        this._deviceCamera = null;
        this._canvas = null;

        this.onQRScanned.removeAllListeners();
    }

}