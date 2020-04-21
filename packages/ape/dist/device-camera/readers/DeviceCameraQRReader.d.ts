import { ArgEvent } from '../../misc/Events';
import { IDeviceCameraReaderOptions, DeviceCameraReader } from './DeviceCameraReader';
export declare class DeviceCameraQRReader extends DeviceCameraReader {
    /**
     * Event that is invoked when a qr code is scanned.
     */
    onQRScanned: ArgEvent<string>;
    constructor();
    start(options: IDeviceCameraReaderOptions): void;
    protected onRenderedToCanvas(canvas: HTMLCanvasElement): void;
    stop(): void;
    dispose(): void;
}
