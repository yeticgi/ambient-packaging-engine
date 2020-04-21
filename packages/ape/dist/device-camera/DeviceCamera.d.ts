import { IDisposable } from '../misc/IDisposable';
export interface IVideoStreamStartResult {
    started: boolean;
    error?: any;
}
/**
 * Device Camera is a class that wraps modern rowser functionality to interact with device camera hardware.
 */
export declare class DeviceCamera implements IDisposable {
    constraints: MediaStreamConstraints;
    private _video;
    private _stream;
    private _playing;
    constructor(constraints?: MediaStreamConstraints);
    /**
     * Is the device camera stream currently playing or not.
     */
    isPlaying(): boolean;
    /**
     * The video element that is playing the device camera feed.
     */
    getVideoElement(): HTMLVideoElement;
    /**
     * Request to start device camera video stream. Promise will return true if successful, otherwise false.
     * Uses the DeviceCamera.constraints object when requesting the camera from the browser.
     *
     * May provide a timeout value in milliseconds.
     */
    startVideoStream(timeout?: number): Promise<IVideoStreamStartResult>;
    /**
     * Stop running video streams and clean up related objects.
     */
    stopVideoStream(): void;
    dispose(): void;
}
