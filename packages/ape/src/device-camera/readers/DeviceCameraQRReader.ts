import jsQR from 'jsqr';
import { ArgEvent } from '../../misc/Events';
import { IDeviceCameraReaderOptions, DeviceCameraReader } from './DeviceCameraReader';

export class DeviceCameraQRReader extends DeviceCameraReader {
    /**
     * Event that is invoked when a qr code is scanned.
     */
    onQRScanned: ArgEvent<string> = new ArgEvent();

    constructor() {
        super();
    }

    start(options: IDeviceCameraReaderOptions): void {
        super.start(options);
    }

    protected onRenderedToCanvas(canvas: HTMLCanvasElement): void {
        super.onRenderedToCanvas(canvas);

        const ctx = canvas.getContext('2d');
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const code = jsQR(imageData.data, imageData.width, imageData.height, {
            inversionAttempts: "dontInvert"
        });

        if (code) {
            this.onQRScanned.invoke(code.data);
        }
    }
    
    stop(): void {
        super.stop();
    }

    dispose(): void {
        super.dispose();

        this.onQRScanned.removeAllListeners();
    }
}