import { DeviceCamera } from '../DeviceCamera';
import { IDisposable } from '../../misc/IDisposable';
export interface IDeviceCameraReaderOptions {
    deviceCamera: DeviceCamera;
}
export declare class DeviceCameraReader implements IDisposable {
    private _deviceCamera;
    private _canvas;
    private _running;
    private _updateHandle;
    get deviceCamera(): DeviceCamera;
    get canvas(): HTMLCanvasElement;
    get running(): boolean;
    constructor();
    /**
     * Start the camera reader with the given options.
     */
    start(options: IDeviceCameraReaderOptions): void;
    private _update;
    protected onRenderedToCanvas(canvas: HTMLCanvasElement): void;
    stop(): void;
    dispose(): void;
}
